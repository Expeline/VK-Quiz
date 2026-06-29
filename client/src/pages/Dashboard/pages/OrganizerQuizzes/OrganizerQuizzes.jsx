import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import { deleteQuiz, fetchQuizzes } from "../../../../api/quizApi";
import { createRoom } from "../../../../api/roomApi";
import DashboardPanel from "../../components/DashboardPanel";

const statusLabels = {
    DRAFT: "Черновик",
    READY: "Готов",
    ACTIVE: "Активен",
    FINISHED: "Завершен",
};

function getErrorMessage(error) {
    return error?.response?.data?.message ?? "Не удалось загрузить квизы.";
}

function OrganizerQuizzes() {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [creatingRoomId, setCreatingRoomId] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function loadQuizzes() {
            setIsLoading(true);
            setError("");

            try {
                const loadedQuizzes = await fetchQuizzes();

                if (isMounted) {
                    setQuizzes(loadedQuizzes);
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

        loadQuizzes();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleDelete = async (quizId) => {
        if (!confirm("Удалить квиз без возможности восстановления?")) {
            return;
        }

        setDeletingId(quizId);
        setError("");

        try {
            await deleteQuiz(quizId);
            setQuizzes((currentQuizzes) => currentQuizzes.filter((quiz) => quiz.id !== quizId));
        } catch (deleteError) {
            setError(getErrorMessage(deleteError));
        } finally {
            setDeletingId(null);
        }
    };

    const handleCreateRoom = async (quizId) => {
        setCreatingRoomId(quizId);
        setError("");

        try {
            const room = await createRoom(quizId);
            navigate(`/dashboard/rooms/${room.id}`);
        } catch (createError) {
            setError(getErrorMessage(createError));
        } finally {
            setCreatingRoomId(null);
        }
    };

    return (
        <DashboardPanel
            title="Мои квизы"
            subtitle="Управляйте черновиками и готовыми квизами."
            action={<Button to="/dashboard/organizer/create" size="sm">Создать квиз</Button>}
        >
            {error && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            {isLoading ? (
                <p className="text-sm font-semibold text-slate-500">Загрузка квизов...</p>
            ) : quizzes.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <h3 className="text-xl font-black text-slate-950">Квизов пока нет</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Создайте первый квиз, добавьте вопросы и сохраните черновик.
                    </p>
                    <Button to="/dashboard/organizer/create" className="mt-5">
                        Создать квиз
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {quizzes.map((quiz) => (
                        <article key={quiz.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                            <div className="flex flex-col items-start justify-between gap-3 min-[420px]:flex-row min-[420px]:gap-4">
                                <div className="min-w-0">
                                    <h3 className="break-words text-lg font-black text-slate-950 sm:text-xl">{quiz.title}</h3>
                                    <p className="mt-2 text-sm text-slate-500">
                                        {quiz._count?.questions ?? 0} вопросов
                                    </p>
                                </div>
                                <span className="w-fit shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-700 shadow-sm">
                                    {statusLabels[quiz.status] ?? quiz.status}
                                </span>
                            </div>

                            {quiz.description && (
                                <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{quiz.description}</p>
                            )}

                            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleCreateRoom(quiz.id)}
                                    disabled={creatingRoomId === quiz.id}
                                >
                                    {creatingRoomId === quiz.id ? "Создание..." : "Комната"}
                                </Button>
                                <Button to={`/dashboard/organizer/quizzes/${quiz.id}/edit`} variant="secondary" size="sm">
                                    Редактировать
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(quiz.id)}
                                    disabled={deletingId === quiz.id}
                                >
                                    {deletingId === quiz.id ? "Удаление..." : "Удалить"}
                                </Button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </DashboardPanel>
    );
}

export default OrganizerQuizzes;
