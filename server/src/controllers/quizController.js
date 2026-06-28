import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

const QUIZ_INCLUDE = {
    questions: {
        orderBy: { order: "asc" },
        include: {
            options: {
                orderBy: { createdAt: "asc" },
            },
        },
    },
};

function sanitizeString(value) {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
}

function normalizeQuizPayload(body) {
    const title = sanitizeString(body.title);

    if (!title) {
        throw new AppError("Введите название квиза.", 400);
    }

    const timeLimit = Number(body.timeLimit ?? 30);

    if (!Number.isInteger(timeLimit) || timeLimit < 5 || timeLimit > 600) {
        throw new AppError("Время на вопрос должно быть от 5 до 600 секунд.", 400);
    }

    return {
        title,
        description: sanitizeString(body.description),
        category: sanitizeString(body.category),
        rules: sanitizeString(body.rules),
        timeLimit,
        showResults: body.showResults !== false,
        status: body.status && ["DRAFT", "READY", "ACTIVE", "FINISHED"].includes(body.status)
            ? body.status
            : "DRAFT",
    };
}

function normalizeQuestionPayload(question, index = 0) {
    const text = sanitizeString(question.text);

    if (!text) {
        throw new AppError("Введите текст вопроса.", 400);
    }

    if (!["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(question.type)) {
        throw new AppError("Некорректный тип вопроса.", 400);
    }

    if (!Array.isArray(question.options) || question.options.length < 2) {
        throw new AppError("Добавьте минимум два варианта ответа.", 400);
    }

    const options = question.options.map((option) => {
        const optionText = sanitizeString(option.text);
        const optionImageUrl = sanitizeString(option.imageUrl);

        if (!optionText && !optionImageUrl) {
            throw new AppError("Вариант ответа должен содержать текст или изображение.", 400);
        }

        return {
            text: optionText ?? "",
            imageUrl: optionImageUrl,
            isCorrect: Boolean(option.isCorrect),
        };
    });

    const correctCount = options.filter((option) => option.isCorrect).length;

    if (question.type === "SINGLE_CHOICE" && correctCount !== 1) {
        throw new AppError("Для одиночного выбора отметьте ровно один правильный ответ.", 400);
    }

    if (question.type === "MULTIPLE_CHOICE" && correctCount < 1) {
        throw new AppError("Для множественного выбора отметьте минимум один правильный ответ.", 400);
    }

    return {
        text,
        imageUrl: sanitizeString(question.imageUrl),
        type: question.type,
        order: Number.isInteger(question.order) ? question.order : index,
        options,
    };
}

async function findOwnedQuiz(quizId, userId) {
    const quiz = await prisma.quiz.findFirst({
        where: {
            id: quizId,
            creatorId: userId,
        },
    });

    if (!quiz) {
        throw new AppError("Квиз не найден.", 404);
    }

    return quiz;
}

async function replaceQuizQuestions(transaction, quizId, questions = []) {
    await transaction.question.deleteMany({
        where: { quizId },
    });

    if (!questions.length) {
        return;
    }

    const normalizedQuestions = questions.map(normalizeQuestionPayload);

    for (const [index, question] of normalizedQuestions.entries()) {
        await transaction.question.create({
            data: {
                quizId,
                text: question.text,
                imageUrl: question.imageUrl,
                type: question.type,
                order: index,
                options: {
                    create: question.options,
                },
            },
        });
    }
}

export async function createQuiz(request, response) {
    const quizData = normalizeQuizPayload(request.body);
    const questions = Array.isArray(request.body.questions) ? request.body.questions : [];

    const quiz = await prisma.$transaction(async (transaction) => {
        const createdQuiz = await transaction.quiz.create({
            data: {
                ...quizData,
                creatorId: request.user.id,
            },
        });

        await replaceQuizQuestions(transaction, createdQuiz.id, questions);

        return transaction.quiz.findUnique({
            where: { id: createdQuiz.id },
            include: QUIZ_INCLUDE,
        });
    });

    response.status(201).json({ quiz });
}

export async function getQuizzes(request, response) {
    const quizzes = await prisma.quiz.findMany({
        where: { creatorId: request.user.id },
        orderBy: { updatedAt: "desc" },
        include: {
            _count: {
                select: { questions: true },
            },
        },
    });

    response.status(200).json({ quizzes });
}

export async function getQuizById(request, response) {
    await findOwnedQuiz(request.params.id, request.user.id);

    const quiz = await prisma.quiz.findUnique({
        where: { id: request.params.id },
        include: QUIZ_INCLUDE,
    });

    response.status(200).json({ quiz });
}

export async function updateQuiz(request, response) {
    await findOwnedQuiz(request.params.id, request.user.id);
    const quizData = normalizeQuizPayload(request.body);
    const shouldReplaceQuestions = Array.isArray(request.body.questions);

    const quiz = await prisma.$transaction(async (transaction) => {
        await transaction.quiz.update({
            where: { id: request.params.id },
            data: quizData,
        });

        if (shouldReplaceQuestions) {
            await replaceQuizQuestions(transaction, request.params.id, request.body.questions);
        }

        return transaction.quiz.findUnique({
            where: { id: request.params.id },
            include: QUIZ_INCLUDE,
        });
    });

    response.status(200).json({ quiz });
}

export async function deleteQuiz(request, response) {
    await findOwnedQuiz(request.params.id, request.user.id);

    await prisma.quiz.delete({
        where: { id: request.params.id },
    });

    response.status(204).send();
}

export async function getQuizQuestions(request, response) {
    await findOwnedQuiz(request.params.quizId, request.user.id);

    const questions = await prisma.question.findMany({
        where: { quizId: request.params.quizId },
        orderBy: { order: "asc" },
        include: {
            options: {
                orderBy: { createdAt: "asc" },
            },
        },
    });

    response.status(200).json({ questions });
}

export async function createQuestion(request, response) {
    await findOwnedQuiz(request.params.quizId, request.user.id);
    const normalizedQuestion = normalizeQuestionPayload(request.body);

    const lastQuestion = await prisma.question.findFirst({
        where: { quizId: request.params.quizId },
        orderBy: { order: "desc" },
        select: { order: true },
    });

    const question = await prisma.question.create({
        data: {
            quizId: request.params.quizId,
            text: normalizedQuestion.text,
            imageUrl: normalizedQuestion.imageUrl,
            type: normalizedQuestion.type,
            order: lastQuestion ? lastQuestion.order + 1 : 0,
            options: {
                create: normalizedQuestion.options,
            },
        },
        include: {
            options: {
                orderBy: { createdAt: "asc" },
            },
        },
    });

    response.status(201).json({ question });
}

export async function updateQuestion(request, response) {
    await findOwnedQuiz(request.params.quizId, request.user.id);
    const normalizedQuestion = normalizeQuestionPayload(request.body);

    const existingQuestion = await prisma.question.findFirst({
        where: {
            id: request.params.questionId,
            quizId: request.params.quizId,
        },
    });

    if (!existingQuestion) {
        throw new AppError("Вопрос не найден.", 404);
    }

    const question = await prisma.$transaction(async (transaction) => {
        await transaction.option.deleteMany({
            where: { questionId: request.params.questionId },
        });

        return transaction.question.update({
            where: { id: request.params.questionId },
            data: {
                text: normalizedQuestion.text,
                imageUrl: normalizedQuestion.imageUrl,
                type: normalizedQuestion.type,
                options: {
                    create: normalizedQuestion.options,
                },
            },
            include: {
                options: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });
    });

    response.status(200).json({ question });
}

export async function deleteQuestion(request, response) {
    await findOwnedQuiz(request.params.quizId, request.user.id);

    const existingQuestion = await prisma.question.findFirst({
        where: {
            id: request.params.questionId,
            quizId: request.params.quizId,
        },
    });

    if (!existingQuestion) {
        throw new AppError("Вопрос не найден.", 404);
    }

    await prisma.question.delete({
        where: { id: request.params.questionId },
    });

    response.status(204).send();
}
