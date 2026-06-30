import { useState } from "react";
import { uploadImage } from "../../../../api/uploadApi";
import Button from "../../../../components/ui/Button";
import { useConfirm } from "../../../../hooks/useConfirm";
import { useLanguage } from "../../../../hooks/useLanguage";

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

function getErrorMessage(error, fallback) {
    return error?.response?.data?.message ?? fallback;
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

function createFieldKey(...parts) {
    return parts.join(".");
}

function OptionalMark() {
    const { t } = useLanguage();
    return <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-500">{t("common.optional")}</span>;
}

function ImageInput({ label, value, onChange, invalid = false }) {
    const { t } = useLanguage();
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
                invalid ? "border-red-300 bg-red-50" : "",
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
                <div className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-700">
                        {label}
                        <OptionalMark />
                    </span>
                    <span className="mt-1 block text-xs font-medium text-slate-500">
                        {t("quiz.uploadHelp")}
                    </span>
                </div>
                <div className="flex flex-col gap-2 min-[420px]:flex-row sm:shrink-0">
                    <label className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-brand-200 hover:bg-brand-50">
                        {isUploading ? t("quiz.uploading") : t("quiz.uploadChoose")}
                        <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(event) => applyFile(event.target.files[0])}
                        />
                    </label>
                    {value && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
                            {t("quiz.uploadRemove")}
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
    const { t } = useLanguage();
    const { confirm } = useConfirm();
    const [form, setForm] = useState(() => normalizeInitialQuiz(initialQuiz));
    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState([]);
    const [invalidFields, setInvalidFields] = useState(() => new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = (name, value) => {
        setValidationErrors([]);
        setInvalidFields(new Set());
        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    };

    const updateQuestion = (questionIndex, updates) => {
        setValidationErrors([]);
        setInvalidFields(new Set());
        setForm((currentForm) => ({
            ...currentForm,
            questions: currentForm.questions.map((question, index) =>
                index === questionIndex ? { ...question, ...updates } : question,
            ),
        }));
    };

    const updateQuestionType = (questionIndex, type) => {
        setValidationErrors([]);
        setInvalidFields(new Set());
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
        setValidationErrors([]);
        setInvalidFields(new Set());
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
        setValidationErrors([]);
        setInvalidFields(new Set());
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
        setValidationErrors([]);
        setInvalidFields(new Set());
        setForm((currentForm) => ({
            ...currentForm,
            questions: [...currentForm.questions, createQuestion()],
        }));
    };

    const removeQuestion = async (questionIndex) => {
        const confirmed = await confirm({
            title: t("quiz.deleteQuestion.title"),
            text: t("quiz.deleteQuestion.text"),
            confirmLabel: t("common.remove"),
        });

        if (!confirmed) {
            return;
        }

        setForm((currentForm) => ({
            ...currentForm,
            questions: currentForm.questions.filter((_, index) => index !== questionIndex),
        }));
    };

    const addOption = (questionIndex) => {
        setValidationErrors([]);
        setInvalidFields(new Set());
        setForm((currentForm) => ({
            ...currentForm,
            questions: currentForm.questions.map((question, index) =>
                index === questionIndex
                    ? { ...question, options: [...question.options, createOption(false)] }
                    : question,
            ),
        }));
    };

    const removeOption = async (questionIndex, optionIndex) => {
        const confirmed = await confirm({
            title: t("quiz.deleteOption.title"),
            text: t("quiz.deleteOption.text"),
            confirmLabel: t("common.remove"),
        });

        if (!confirmed) {
            return;
        }

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

    const validateForm = () => {
        const nextErrors = [];
        const nextInvalidFields = new Set();
        const timeLimit = Number(form.timeLimit);

        if (!form.title.trim()) {
            nextErrors.push(t("quiz.validation.quizTitle"));
            nextInvalidFields.add("title");
        }

        if (!Number.isInteger(timeLimit) || timeLimit < 5 || timeLimit > 600) {
            nextErrors.push(t("quiz.validation.timeLimit"));
            nextInvalidFields.add("timeLimit");
        }

        form.questions.forEach((question, questionIndex) => {
            const questionNumber = questionIndex + 1;

            if (!question.text.trim()) {
                nextErrors.push(t("quiz.validation.questionText", { question: questionNumber }));
                nextInvalidFields.add(createFieldKey("questions", questionIndex, "text"));
            }

            question.options.forEach((option, optionIndex) => {
                if (!option.text.trim() && !option.imageUrl) {
                    nextErrors.push(t("quiz.validation.optionContent", {
                        question: questionNumber,
                        option: optionIndex + 1,
                    }));
                    nextInvalidFields.add(createFieldKey("questions", questionIndex, "options", optionIndex, "content"));
                }
            });

            const correctCount = question.options.filter((option) => option.isCorrect).length;

            if (question.type === "SINGLE_CHOICE" && correctCount !== 1) {
                nextErrors.push(t("quiz.validation.singleCorrect", { question: questionNumber }));
                nextInvalidFields.add(createFieldKey("questions", questionIndex, "correct"));
            }

            if (question.type === "MULTIPLE_CHOICE" && correctCount < 1) {
                nextErrors.push(t("quiz.validation.multipleCorrect", { question: questionNumber }));
                nextInvalidFields.add(createFieldKey("questions", questionIndex, "correct"));
            }
        });

        return { nextErrors, nextInvalidFields };
    };

    const getInputClassName = (invalid = false, baseBackground = "bg-slate-50") => [
        "h-12 w-full rounded-2xl border px-4 outline-none transition focus:ring-4",
        invalid
            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/10"
            : `border-slate-200 ${baseBackground} focus:border-brand-500 focus:bg-white focus:ring-brand-500/10`,
    ].join(" ");

    const getTextareaClassName = (invalid = false) => [
        "w-full rounded-2xl border px-4 py-3 outline-none transition focus:ring-4",
        invalid
            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/10"
            : "border-slate-200 bg-slate-50 focus:border-brand-500 focus:bg-white focus:ring-brand-500/10",
    ].join(" ");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setValidationErrors([]);
        setInvalidFields(new Set());

        const { nextErrors, nextInvalidFields } = validateForm();

        if (nextErrors.length) {
            setValidationErrors(nextErrors);
            setInvalidFields(nextInvalidFields);
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(buildPayload(form));
        } catch (submitError) {
            setError(getErrorMessage(submitError, t("quiz.error.save")));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="grid gap-5 sm:gap-6" onSubmit={handleSubmit}>
            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}
            {validationErrors.length > 0 && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    <p className="font-black">{t("quiz.validation.title")}</p>
                    <ul className="mt-2 grid gap-1">
                        {validationErrors.map((validationError) => (
                            <li key={validationError}>{validationError}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid gap-5 lg:grid-cols-[1fr_14rem]">
                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">{t("quiz.title")}</span>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(event) => updateField("title", event.target.value)}
                        placeholder={t("quiz.titlePlaceholder")}
                        className={getInputClassName(invalidFields.has("title"))}
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">{t("quiz.time")}</span>
                    <input
                        type="number"
                        min="5"
                        max="600"
                        value={form.timeLimit}
                        onChange={(event) => updateField("timeLimit", event.target.value)}
                        className={getInputClassName(invalidFields.has("timeLimit"))}
                    />
                    <span className="mt-2 block text-xs font-semibold text-slate-500">{t("quiz.timeHelp")}</span>
                </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">{t("quiz.category")} <OptionalMark /></span>
                    <input
                        type="text"
                        value={form.category}
                        onChange={(event) => updateField("category", event.target.value)}
                        placeholder={t("quiz.categoryPlaceholder")}
                        className={getInputClassName()}
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">{t("quiz.status")}</span>
                    <select
                        value={form.status}
                        onChange={(event) => updateField("status", event.target.value)}
                        className={`${getInputClassName()} quiz-select`}
                    >
                        <option value="DRAFT">{t("quiz.status.draft")}</option>
                        <option value="READY">{t("quiz.status.ready")}</option>
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
                    <span className="block text-sm font-black text-slate-900">{t("quiz.showResults")}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-500">
                        {t("quiz.showResultsHelp")}
                    </span>
                </span>
            </label>

            <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">{t("quiz.description")} <OptionalMark /></span>
                <textarea
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    rows="3"
                    className={getTextareaClassName()}
                />
            </label>

            <div className="border-y border-slate-100 py-5">
                <div className="min-w-0">
                    <h3 className="text-xl font-black text-slate-950">{t("quiz.questions")}</h3>
                </div>
            </div>

            <div className="grid gap-5">
                {form.questions.map((question, questionIndex) => (
                    <article key={question.clientId} className="rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <h4 className="text-lg font-black text-slate-950">{t("quiz.question")} {questionIndex + 1}</h4>
                            {form.questions.length > 1 && (
                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    onClick={() => removeQuestion(questionIndex)}
                                >
                                    {t("common.remove")}
                                </Button>
                            )}
                        </div>

                        <div className="mt-4 grid gap-4">
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">{t("quiz.questionText")}</span>
                                <input
                                    type="text"
                                    value={question.text}
                                    onChange={(event) => updateQuestion(questionIndex, { text: event.target.value })}
                                    className={getInputClassName(
                                        invalidFields.has(createFieldKey("questions", questionIndex, "text")),
                                        "bg-white",
                                    )}
                                />
                            </label>

                            <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
                                <ImageInput
                                    label={t("quiz.questionImage")}
                                    value={question.imageUrl}
                                    onChange={(imageUrl) => updateQuestion(questionIndex, { imageUrl })}
                                />

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-700">{t("quiz.type")}</span>
                                    <select
                                        value={question.type}
                                        onChange={(event) => updateQuestionType(questionIndex, event.target.value)}
                                        className={`${getInputClassName(false, "bg-white")} quiz-select`}
                                    >
                                        <option value="SINGLE_CHOICE">{t("quiz.type.single")}</option>
                                        <option value="MULTIPLE_CHOICE">{t("quiz.type.multiple")}</option>
                                    </select>
                                </label>
                            </div>

                            <div className="grid gap-3">
                                {question.options.map((option, optionIndex) => (
                                    <div
                                        key={option.clientId}
                                        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 lg:grid-cols-[2rem_1fr_auto]"
                                    >
                                        <label className="flex min-h-12 items-center gap-3 lg:justify-center">
                                            <input
                                                type={question.type === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                                                name={`question-${question.clientId}`}
                                                checked={option.isCorrect}
                                                onChange={() => toggleCorrectOption(questionIndex, optionIndex)}
                                                className={[
                                                    "h-4 w-4 accent-brand-600",
                                                    invalidFields.has(createFieldKey("questions", questionIndex, "correct"))
                                                        ? "outline outline-2 outline-offset-2 outline-red-400"
                                                        : "",
                                                ].join(" ")}
                                            />
                                            <span className="text-sm font-semibold text-slate-500 lg:hidden">
                                                {t("quiz.correct")}
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(event) =>
                                                updateOption(questionIndex, optionIndex, { text: event.target.value })
                                            }
                                            placeholder={`${t("quiz.option")} ${optionIndex + 1}`}
                                            className={getInputClassName(
                                                invalidFields.has(createFieldKey("questions", questionIndex, "options", optionIndex, "content")),
                                            )}
                                        />

                                        {question.options.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="danger"
                                                size="sm"
                                                onClick={() => removeOption(questionIndex, optionIndex)}
                                            >
                                                {t("common.remove")}
                                            </Button>
                                        )}
                                        <div className="lg:col-start-2 lg:col-end-4">
                                            <ImageInput
                                                label={t("quiz.optionImage")}
                                                value={option.imageUrl}
                                                onChange={(imageUrl) =>
                                                    updateOption(questionIndex, optionIndex, { imageUrl })
                                                }
                                                invalid={invalidFields.has(createFieldKey("questions", questionIndex, "options", optionIndex, "content"))}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button type="button" variant="secondary" size="sm" className="w-full sm:w-fit" onClick={() => addOption(questionIndex)}>
                                {t("quiz.addOption")}
                            </Button>
                        </div>
                    </article>
                ))}
            </div>

            <div className="rounded-3xl border border-dashed border-brand-200 bg-brand-50 p-4">
                <Button type="button" variant="secondary" className="w-full" onClick={addQuestion}>
                    {t("quiz.addQuestion")}
                </Button>
            </div>

            <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">{t("quiz.rules")} <OptionalMark /></span>
                <textarea
                    value={form.rules}
                    onChange={(event) => updateField("rules", event.target.value)}
                    rows="3"
                    className={getTextareaClassName()}
                />
            </label>

            <div className="flex justify-center">
                <Button type="submit" className="w-full max-w-xl" disabled={isSubmitting}>
                    {isSubmitting ? t("quiz.saving") : submitLabel}
                </Button>
            </div>
        </form>
    );
}

export default QuizBuilder;
