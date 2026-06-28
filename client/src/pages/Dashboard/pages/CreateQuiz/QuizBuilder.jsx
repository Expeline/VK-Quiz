import { useMemo, useState } from "react";
import { uploadImage } from "../../../../api/uploadApi";
import Button from "../../../../components/ui/Button";

const emptyQuiz = {
    title: "",
    description: "",
    category: "",
    timeLimit: 30,
    showResults: true,
    rules: "",
    status: "DRAFT",
    questions: [],
};

function createOption(isCorrect = false) {
    return {
        clientId: crypto.randomUUID(),
        text: "",
        imageUrl: "",
        isCorrect,
    };
}

function createQuestion() {
    return {
        clientId: crypto.randomUUID(),
        text: "",
        imageUrl: "",
        type: "SINGLE_CHOICE",
        options: [createOption(true), createOption(false)],
    };
}

function normalizeInitialQuiz(initialQuiz) {
    if (!initialQuiz) {
        return {
            ...emptyQuiz,
            questions: [createQuestion()],
        };
    }

    return {
        title: initialQuiz.title ?? "",
        description: initialQuiz.description ?? "",
        category: initialQuiz.category ?? "",
        timeLimit: initialQuiz.timeLimit ?? 30,
        showResults: initialQuiz.showResults !== false,
        rules: initialQuiz.rules ?? "",
        status: initialQuiz.status ?? "DRAFT",
        questions: (initialQuiz.questions ?? []).map((question) => ({
            ...question,
            clientId: question.id ?? crypto.randomUUID(),
            imageUrl: question.imageUrl ?? "",
            options: (question.options ?? []).map((option) => ({
                ...option,
                clientId: option.id ?? crypto.randomUUID(),
                imageUrl: option.imageUrl ?? "",
            })),
        })),
    };
}

function getErrorMessage(error) {
    return error?.response?.data?.message ?? "Не удалось сохранить квиз.";
}

function buildPayload(form) {
    return {
        ...form,
        timeLimit: Number(form.timeLimit),
        questions: form.questions.map((question, questionIndex) => ({
            text: question.text,
            imageUrl: question.imageUrl,
            type: question.type,
            order: questionIndex,
            options: question.options.map((option) => ({
                text: option.text,
                imageUrl: option.imageUrl,
                isCorrect: option.isCorrect,
            })),
        })),
    };
}

function ImageInput({ label, value, onChange }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const applyFile = async (file) => {
        if (!file?.type.startsWith("image/")) {
            return;
        }

        setIsUploading(true);

        try {
            const imageUrl = await uploadImage(file);
            onChange(imageUrl);
        } finally {
            setIsUploading(false);
        }
    };

    const handlePaste = async (event) => {
        const imageFile = [...event.clipboardData.files].find((file) => file.type.startsWith("image/"));

        if (imageFile) {
            event.preventDefault();
            await applyFile(imageFile);
        }
    };

    const handleDrop = async (event) => {
        event.preventDefault();
        setIsDragging(false);
        await applyFile(event.dataTransfer.files[0]);
    };

    return (
        <div
            className={[
                "rounded-2xl border border-slate-200 bg-white p-4 transition",
                isDragging ? "border-brand-500 bg-brand-50" : "",
            ].join(" ")}
            onPaste={handlePaste}
            onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="block text-sm font-semibold text-slate-700">{label}</span>
                    <span className="mt-1 block text-xs font-medium text-slate-500">
                        Выберите файл, перетащите картинку или вставьте из буфера. Файл сохранится на сервере.
                    </span>
                </div>
                <div className="flex gap-2">
                    <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-brand-200 hover:bg-brand-50">
                        {isUploading ? "Загрузка..." : "Выбрать"}
                        <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(event) => applyFile(event.target.files[0])}
                        />
                    </label>
                    {value && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
                            Убрать
                        </Button>
                    )}
                </div>
            </div>
            {value && (
                <div className="mt-4 flex justify-center rounded-2xl bg-slate-100 p-3">
                    <img src={value} alt="" className="max-h-56 max-w-full rounded-xl object-contain" />
                </div>
            )}
        </div>
    );
}

function QuizBuilder({ initialQuiz, onSubmit, submitLabel }) {
    const [form, setForm] = useState(() => normalizeInitialQuiz(initialQuiz));
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const questionCount = form.questions.length;
    const optionCount = useMemo(
        () => form.questions.reduce((sum, question) => sum + question.options.length, 0),
        [form.questions],
    );

    const updateField = (name, value) => {
        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    };

    const updateQuestion = (questionIndex, updates) => {
        setForm((currentForm) => ({
            ...currentForm,
            questions: currentForm.questions.map((question, index) =>
                index === questionIndex ? { ...question, ...updates } : question,
            ),
        }));
    };

    const updateQuestionType = (questionIndex, type) => {
        setForm((currentForm) => ({
            ...currentForm,
            questions: currentForm.questions.map((question, index) => {
                if (index !== questionIndex) {
                    return question;
                }

                if (type === "MULTIPLE_CHOICE") {
                    return { ...question, type };
                }

                let hasCorrectOption = false;

                return {
                    ...question,
                    type,
                    options: question.options.map((option, optionIndex) => {
                        const isCorrect = !hasCorrectOption && (option.isCorrect || optionIndex === 0);
                        hasCorrectOption = hasCorrectOption || isCorrect;

                        return { ...option, isCorrect };
                    }),
                };
            }),
        }));
    };

    const updateOption = (questionIndex, optionIndex, updates) => {
        setForm((currentForm) => ({
            ...currentForm,
            questions: currentForm.questions.map((question, index) => {
                if (index !== questionIndex) {
                    return question;
                }

                return {
                    ...question,
                    options: question.options.map((option, currentOptionIndex) =>
                        currentOptionIndex === optionIndex ? { ...option, ...updates } : option,
                    ),
                };
            }),
        }));
    };

    const toggleCorrectOption = (questionIndex, optionIndex) => {
        setForm((currentForm) => ({
            ...currentForm,
            questions: currentForm.questions.map((question, index) => {
                if (index !== questionIndex) {
                    return question;
                }

                return {
                    ...question,
                    options: question.options.map((option, currentOptionIndex) => ({
                        ...option,
                        isCorrect:
                            question.type === "SINGLE_CHOICE"
                                ? currentOptionIndex === optionIndex
                                : currentOptionIndex === optionIndex
                                    ? !option.isCorrect
                                    : option.isCorrect,
                    })),
                };
            }),
        }));
    };

    const addQuestion = () => {
        setForm((currentForm) => ({
            ...currentForm,
            questions: [...currentForm.questions, createQuestion()],
        }));
    };

    const removeQuestion = (questionIndex) => {
        setForm((currentForm) => ({
            ...currentForm,
            questions: currentForm.questions.filter((_, index) => index !== questionIndex),
        }));
    };

    const addOption = (questionIndex) => {
        setForm((currentForm) => ({
            ...currentForm,
            questions: currentForm.questions.map((question, index) =>
                index === questionIndex
                    ? { ...question, options: [...question.options, createOption(false)] }
                    : question,
            ),
        }));
    };

    const removeOption = (questionIndex, optionIndex) => {
        setForm((currentForm) => ({
            ...currentForm,
            questions: currentForm.questions.map((question, index) => {
                if (index !== questionIndex || question.options.length <= 2) {
                    return question;
                }

                const nextOptions = question.options.filter((_, currentOptionIndex) => currentOptionIndex !== optionIndex);

                if (!nextOptions.some((option) => option.isCorrect)) {
                    nextOptions[0] = { ...nextOptions[0], isCorrect: true };
                }

                return { ...question, options: nextOptions };
            }),
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await onSubmit(buildPayload(form));
        } catch (submitError) {
            setError(getErrorMessage(submitError));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="grid gap-6" onSubmit={handleSubmit}>
            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-5 lg:grid-cols-[1fr_14rem]">
                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Название квиза</span>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(event) => updateField("title", event.target.value)}
                        placeholder="Например: Frontend Battle"
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Время</span>
                    <input
                        type="number"
                        min="5"
                        max="600"
                        value={form.timeLimit}
                        onChange={(event) => updateField("timeLimit", event.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                    />
                </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Категория</span>
                    <input
                        type="text"
                        value={form.category}
                        onChange={(event) => updateField("category", event.target.value)}
                        placeholder="Веб-разработка"
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Статус</span>
                    <select
                        value={form.status}
                        onChange={(event) => updateField("status", event.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                    >
                        <option value="DRAFT">Черновик</option>
                        <option value="READY">Готов</option>
                    </select>
                </label>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <input
                    type="checkbox"
                    checked={form.showResults}
                    onChange={(event) => updateField("showResults", event.target.checked)}
                    className="mt-1 h-4 w-4 accent-brand-600"
                />
                <span>
                    <span className="block text-sm font-black text-slate-900">Показывать результаты участникам</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-500">
                        Участники увидят правильность ответа, баллы и общий лидерборд. Если выключить, подробные результаты останутся только у организатора.
                    </span>
                </span>
            </label>

            <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Описание</span>
                <textarea
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    rows="3"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
            </label>

            <div className="flex flex-col gap-3 border-y border-slate-100 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-950">Вопросы</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {questionCount} вопросов, {optionCount} вариантов
                    </p>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>
                    Добавить вопрос
                </Button>
            </div>

            <div className="grid gap-5">
                {form.questions.map((question, questionIndex) => (
                    <article key={question.clientId} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <h4 className="text-lg font-black text-slate-950">Вопрос {questionIndex + 1}</h4>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestion(questionIndex)}
                                disabled={form.questions.length <= 1}
                            >
                                Удалить
                            </Button>
                        </div>

                        <div className="mt-4 grid gap-4">
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Текст вопроса</span>
                                <input
                                    type="text"
                                    value={question.text}
                                    onChange={(event) => updateQuestion(questionIndex, { text: event.target.value })}
                                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                                />
                            </label>

                            <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
                                <ImageInput
                                    label="Изображение вопроса"
                                    value={question.imageUrl}
                                    onChange={(imageUrl) => updateQuestion(questionIndex, { imageUrl })}
                                />

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-700">Тип</span>
                                    <select
                                        value={question.type}
                                        onChange={(event) => updateQuestionType(questionIndex, event.target.value)}
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                                    >
                                        <option value="SINGLE_CHOICE">Один ответ</option>
                                        <option value="MULTIPLE_CHOICE">Несколько ответов</option>
                                    </select>
                                </label>
                            </div>

                            <div className="grid gap-3">
                                {question.options.map((option, optionIndex) => (
                                    <div
                                        key={option.clientId}
                                        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:grid-cols-[2rem_1fr_auto]"
                                    >
                                        <label className="flex h-12 items-center justify-center">
                                            <input
                                                type={question.type === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                                                name={`question-${question.clientId}`}
                                                checked={option.isCorrect}
                                                onChange={() => toggleCorrectOption(questionIndex, optionIndex)}
                                                className="h-4 w-4 accent-brand-600"
                                            />
                                        </label>

                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(event) =>
                                                updateOption(questionIndex, optionIndex, { text: event.target.value })
                                            }
                                            placeholder={`Вариант ${optionIndex + 1}`}
                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                                        />

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeOption(questionIndex, optionIndex)}
                                            disabled={question.options.length <= 2}
                                        >
                                            Удалить
                                        </Button>
                                        <div className="lg:col-start-2 lg:col-end-4">
                                            <ImageInput
                                                label="Изображение варианта"
                                                value={option.imageUrl}
                                                onChange={(imageUrl) =>
                                                    updateOption(questionIndex, optionIndex, { imageUrl })
                                                }
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button type="button" variant="secondary" size="sm" className="w-fit" onClick={() => addOption(questionIndex)}>
                                Добавить вариант
                            </Button>
                        </div>
                    </article>
                ))}
            </div>

            <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Правила</span>
                <textarea
                    value={form.rules}
                    onChange={(event) => updateField("rules", event.target.value)}
                    rows="3"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
            </label>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button to="/dashboard/organizer/quizzes" variant="secondary">
                    К списку
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Сохранение..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}

export default QuizBuilder;
