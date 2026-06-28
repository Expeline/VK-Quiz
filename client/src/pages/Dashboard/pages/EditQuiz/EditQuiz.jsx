import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchQuiz, updateQuiz } from "../../../../api/quizApi";
import DashboardPanel from "../../components/DashboardPanel";
import QuizBuilder from "../CreateQuiz/QuizBuilder";

function getErrorMessage(error) {
    return error?.response?.data?.message ?? "Не удалось загрузить квиз.";
}

function EditQuiz() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadQuiz() {
            setIsLoading(true);
            setError("");

            try {
                const loadedQuiz = await fetchQuiz(id);

                if (isMounted) {
                    setQuiz(loadedQuiz);
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(getErrorMessage(loadError));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadQuiz();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleSubmit = async (payload) => {
        const updatedQuiz = await updateQuiz(id, payload);
        setQuiz(updatedQuiz);
        navigate("/dashboard/organizer/quizzes");
    };

    return (
        <DashboardPanel
            title="Редактировать квиз"
            subtitle="Измените параметры, вопросы и варианты ответов. Сохранение заменит текущий набор вопросов."
        >
            {isLoading ? (
                <p className="text-sm font-semibold text-slate-500">Загрузка квиза...</p>
            ) : error ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            ) : (
                <QuizBuilder
                    key={quiz.id}
                    initialQuiz={quiz}
                    onSubmit={handleSubmit}
                    submitLabel="Сохранить изменения"
                />
            )}
        </DashboardPanel>
    );
}

export default EditQuiz;
