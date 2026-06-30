import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createSocket } from "../../../../api/socketClient";
import { fetchRoom } from "../../../../api/roomApi";
import Button from "../../../../components/ui/Button";
import { useAuth } from "../../../../hooks/useAuth";
import DashboardPanel from "../../components/DashboardPanel";

const statusLabels = {
    WAITING: "Ожидание",
    ACTIVE: "Активен",
    FINISHED: "Завершен",
};

function getErrorMessage(error) {
    return error?.response?.data?.message ?? error?.message ?? "Ошибка комнаты.";
}

function LiveRoom() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [room, setRoom] = useState(null);
    const [role, setRole] = useState(null);
    const [selectedOptionIds, setSelectedOptionIds] = useState([]);
    const [answerResult, setAnswerResult] = useState(null);
    const socketRef = useRef(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [now, setNow] = useState(0);

    const isOrganizer = role === "ORGANIZER";
    const currentQuestion = room?.currentQuestion;
    const showResults = isOrganizer || room?.quiz.showResults;
    const currentParticipant = useMemo(
        () => room?.participants.find((entry) => entry.userId === user?.id),
        [room, user],
    );
    const currentAnswer = useMemo(
        () => currentParticipant?.answers?.find((answer) => answer.questionId === currentQuestion?.id),
        [currentParticipant, currentQuestion],
    );
    const remainingSeconds = useMemo(() => {
        if (room?.status !== "ACTIVE" || !room.currentQuestionStartedAt) {
            return 0;
        }

        if (!now) {
            return room.phase === "REVEAL" ? 10 : room.quiz.timeLimit;
        }

        const isReveal = room.phase === "REVEAL";
        const startedAt = new Date(isReveal ? room.questionRevealStartedAt : room.currentQuestionStartedAt).getTime();
        const endsAt = startedAt + (isReveal ? 10 : room.quiz.timeLimit) * 1000;
        return Math.max(0, Math.ceil((endsAt - now) / 1000));
    }, [now, room]);
    const hasAnswered = useMemo(() => {
        return Boolean(currentAnswer);
    }, [currentAnswer]);
    const organizerAnswerRows = useMemo(() => {
        if (!currentQuestion || !room?.participants) {
            return [];
        }

        return room.participants.map((participant) => {
            const answer = participant.answers?.find((entry) => entry.questionId === currentQuestion.id);
            const selectedOptions = answer?.selectedOptionIds
                ?.map((optionId) => currentQuestion.options.find((option) => option.id === optionId))
                .filter(Boolean) ?? [];

            return {
                participant,
                answer,
                selectedText: selectedOptions.length
                    ? selectedOptions.map((option) => option.text || "Изображение").join(", ")
                    : "Ждет ответа",
            };
        });
    }, [currentQuestion, room]);

    useEffect(() => {
        let isMounted = true;

        async function loadRoom() {
            setIsLoading(true);
            setError("");

            try {
                const data = await fetchRoom(id);

                if (isMounted) {
                    setRoom(data.room);
                    setRole(data.role);
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

        loadRoom();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        const intervalId = setInterval(() => setNow(Date.now()), 300);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const nextSocket = createSocket();
        socketRef.current = nextSocket;

        nextSocket.on("connect", () => {
            nextSocket.emit("room:join", { roomId: id });
        });

        nextSocket.on("room:state", (nextRoom) => {
            setRoom(nextRoom);
        });

        nextSocket.on("quiz:question", (nextRoom) => {
            setRoom(nextRoom);
            setSelectedOptionIds([]);
            setAnswerResult(null);
        });

        nextSocket.on("quiz:started", (nextRoom) => {
            setRoom(nextRoom);
            setSelectedOptionIds([]);
            setAnswerResult(null);
        });

        nextSocket.on("quiz:reveal", (nextRoom) => {
            setRoom(nextRoom);
        });

        nextSocket.on("quiz:finished", (nextRoom) => {
            setRoom(nextRoom);
            setSelectedOptionIds([]);
        });

        nextSocket.on("answer:result", (result) => {
            setAnswerResult(result);
        });

        nextSocket.on("room:error", (payload) => {
            setError(payload.message);
        });

        nextSocket.on("connect_error", (socketError) => {
            setError(socketError.message);
        });

        nextSocket.connect();

        return () => {
            nextSocket.emit("room:leave", { roomId: id });
            nextSocket.disconnect();
            socketRef.current = null;
        };
    }, [id]);

    const emitOrganizerAction = (eventName) => {
        setError("");
        socketRef.current?.emit(eventName, { roomId: id });
    };

    const toggleOption = (optionId) => {
        if (!currentQuestion || answerResult || room?.phase !== "QUESTION") {
            return;
        }

        if (currentQuestion.type === "SINGLE_CHOICE") {
            setSelectedOptionIds([optionId]);
            return;
        }

        setSelectedOptionIds((currentIds) =>
            currentIds.includes(optionId)
                ? currentIds.filter((currentId) => currentId !== optionId)
                : [...currentIds, optionId],
        );
    };

    const submitAnswer = () => {
        setError("");
        socketRef.current?.emit("answer:submit", {
            roomId: id,
            selectedOptionIds,
        });
    };

    const getOptionClassName = (optionId) => {
        const selectedIds = answerResult?.selectedOptionIds ?? currentAnswer?.selectedOptionIds ?? selectedOptionIds;
        const isSelected = selectedIds.includes(optionId);
        const isCorrect = currentQuestion?.options.find((option) => option.id === optionId)?.isCorrect
            || answerResult?.correctOptionIds?.includes(optionId);
        const isReveal = room?.phase === "REVEAL" || room?.status === "FINISHED";

        if (isReveal && showResults && isCorrect) {
            return "border-emerald-400 bg-emerald-100 text-emerald-950 ring-4 ring-emerald-400 shadow-lg shadow-emerald-500/30";
        }

        if (isReveal && showResults && isSelected && !isCorrect) {
            return "border-red-500 bg-red-50 text-red-900 ring-4 ring-red-300 shadow-lg shadow-red-500/20";
        }

        if (isSelected) {
            return "border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-100";
        }

        return "border-slate-200 bg-white text-slate-700 hover:border-brand-200";
    };

    if (isLoading) {
        return (
            <DashboardPanel title="Комната" subtitle="Загрузка состояния комнаты">
                <p className="text-sm font-semibold text-slate-500">Загрузка...</p>
            </DashboardPanel>
        );
    }

    return (
        <DashboardPanel
            title={room?.quiz.title ?? "Комната"}
            subtitle={isOrganizer ? "Управление live-комнатой" : "Прохождение квиза в реальном времени"}
            action={<Button to="/dashboard" variant="secondary" size="sm">В кабинет</Button>}
        >
            {error && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            {!room ? (
                <p className="text-sm font-semibold text-slate-500">Комната не найдена.</p>
            ) : (
                <div className="grid gap-6">
                    {room.quiz.organizer && (
                        <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="grid size-12 place-items-center overflow-hidden rounded-full bg-brand-100 text-lg font-black text-brand-700">
                                {room.quiz.organizer.avatarUrl ? (
                                    <img src={room.quiz.organizer.avatarUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    room.quiz.organizer.name.slice(0, 1).toUpperCase()
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Организатор</p>
                                <p className="truncate font-black text-slate-950">{room.quiz.organizer.name}</p>
                            </div>
                        </div>
                    )}

                    <div className="room-code-card rounded-3xl border border-brand-200 bg-brand-50 p-4 sm:p-5">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">Код комнаты</p>
                        <p className="room-code-text mt-2 break-all text-3xl font-black tracking-[0.1em] text-brand-900 min-[380px]:text-4xl sm:text-5xl sm:tracking-[0.14em]">{room.code}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Статус</p>
                            <p className="mt-2 text-xl font-black text-slate-950">{statusLabels[room.status]}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Вопрос</p>
                            <p className="mt-2 text-xl font-black text-slate-950">
                                {room.status === "WAITING" ? "Не начат" : `${room.currentIndex + 1}/${room.quiz.questionsCount}`}
                            </p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Участники</p>
                            <p className="mt-2 text-xl font-black text-slate-950">{room.participants.length}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Таймер</p>
                            <p className={["mt-2 text-3xl font-black", remainingSeconds <= 5 && room.status === "ACTIVE" ? "text-red-600" : "text-slate-950"].join(" ")}>
                                {room.status === "ACTIVE" ? `${remainingSeconds} c` : "--"}
                            </p>
                            {room.status === "ACTIVE" && (
                                <p className="mt-1 text-xs font-bold text-slate-500">
                                    {room.phase === "REVEAL" ? "Показ ответа" : "Ответ на вопрос"}
                                </p>
                            )}
                        </div>
                    </div>

                    {isOrganizer && (
                        <div className="grid gap-3 sm:flex sm:flex-wrap">
                            <Button
                                type="button"
                                onClick={() => emitOrganizerAction("quiz:start")}
                                disabled={room.status !== "WAITING" || room.participants.length === 0}
                            >
                                Начать квиз
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => emitOrganizerAction("quiz:next")}
                                disabled={room.status !== "ACTIVE"}
                            >
                                Следующий вопрос
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => emitOrganizerAction("quiz:finish")}
                                disabled={room.status === "FINISHED"}
                            >
                                Завершить
                            </Button>
                        </div>
                    )}

                    {room.status === "WAITING" && (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center sm:p-8">
                            <h3 className="text-xl font-black text-slate-950">Ожидание участников</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Передайте участникам код выше. Квиз можно начать, когда в комнату войдет хотя бы один участник.
                            </p>
                        </div>
                    )}

                    {room.status === "ACTIVE" && currentQuestion && (
                        <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">
                                        {currentQuestion.type === "SINGLE_CHOICE" ? "Один ответ" : "Несколько ответов"}
                                    </p>
                                    <h3 className="mt-2 break-words text-xl font-black text-slate-950 sm:text-2xl">{currentQuestion.text}</h3>
                                </div>
                                <span className="w-fit shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                                    {room.quiz.timeLimit} сек.
                                </span>
                            </div>

                            {currentQuestion.imageUrl && (
                                <div className="mt-5 flex justify-center rounded-2xl bg-white p-3">
                                    <img
                                        src={currentQuestion.imageUrl}
                                        alt=""
                                        className="max-h-80 max-w-full rounded-xl object-contain"
                                    />
                                </div>
                            )}

                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                                {currentQuestion.options.map((option) => {
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => toggleOption(option.id)}
                                            disabled={isOrganizer || Boolean(answerResult) || room.phase !== "QUESTION"}
                                            className={[
                                                "min-h-14 rounded-2xl border p-4 text-left font-semibold transition",
                                                getOptionClassName(option.id),
                                            ].join(" ")}
                                        >
                                            <span className="break-words">{option.text || "Изображение"}</span>
                                            {option.imageUrl && (
                                                <div className="mt-3 flex justify-center rounded-xl bg-slate-100 p-2">
                                                    <img
                                                        src={option.imageUrl}
                                                        alt=""
                                                        className="max-h-40 max-w-full rounded-lg object-contain"
                                                    />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {isOrganizer && (
                                <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">
                                                Ответы участников
                                            </p>
                                            <h4 className="mt-1 text-lg font-black text-slate-950">
                                                Кто что выбрал и за сколько
                                            </h4>
                                        </div>
                                        <span className="text-sm font-bold text-slate-500">
                                            {organizerAnswerRows.filter((row) => row.answer).length}/{organizerAnswerRows.length}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid gap-2">
                                        {organizerAnswerRows.map(({ participant, answer, selectedText }) => (
                                            <div
                                                key={participant.id}
                                                className={[
                                                    "grid gap-2 rounded-2xl border px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]",
                                                    answer ? "border-brand-200 bg-brand-50" : "border-slate-200 bg-slate-50",
                                                ].join(" ")}
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate font-black text-slate-950">{participant.displayName}</p>
                                                    <p className="text-xs font-semibold text-slate-500">{participant.score} баллов</p>
                                                </div>
                                                <p className="min-w-0 break-words text-sm font-semibold text-slate-700">
                                                    {selectedText}
                                                </p>
                                                <div className="text-left sm:text-right">
                                                    {answer ? (
                                                        <>
                                                            <p className="text-sm font-black text-brand-700">
                                                                {(answer.responseTimeMs / 1000).toFixed(1)} c
                                                            </p>
                                                            <p className="text-xs font-semibold text-slate-500">
                                                                +{answer.score}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">
                                                            ожидание
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!isOrganizer && (
                                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    {answerResult ? (
                                        <div className={[
                                            "rounded-2xl px-4 py-3 text-sm font-black",
                                            showResults
                                                ? answerResult.isCorrect
                                                    ? "bg-emerald-50 text-emerald-800"
                                                    : "bg-red-50 text-red-800"
                                                : "bg-slate-100 text-slate-700",
                                            ].join(" ")}>
                                            {showResults
                                                ? `Ответ принят: ${answerResult.isCorrect ? "верно" : "неверно"}, +${answerResult.score}`
                                                : "Ответ принят"}
                                        </div>
                                    ) : (
                                        <p className="text-sm font-semibold text-slate-500">
                                            {room.phase === "REVEAL"
                                                ? showResults
                                                    ? "Проверьте правильный ответ. Следующий вопрос скоро появится."
                                                    : "Ответы приняты. Следующий вопрос скоро появится."
                                                : hasAnswered ? "Ответ уже отправлен." : "Выберите вариант и отправьте ответ."}
                                        </p>
                                    )}
                                    <Button
                                        type="button"
                                        onClick={submitAnswer}
                                        disabled={selectedOptionIds.length === 0 || Boolean(answerResult) || hasAnswered || room.phase !== "QUESTION"}
                                    >
                                        Отправить ответ
                                    </Button>
                                </div>
                            )}
                        </article>
                    )}

                    {room.status === "FINISHED" && (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="text-xl font-black text-slate-950">Лидерборд</h3>
                                <Button type="button" variant="secondary" size="sm" onClick={() => navigate("/dashboard")}>
                                    В кабинет
                                </Button>
                            </div>
                            {showResults ? (
                                <div className="mt-5 grid gap-3">
                                    {room.leaderboard.map((entry) => (
                                        <div key={entry.participantId} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-black text-slate-950">
                                                    {entry.place}. {entry.displayName}
                                                </p>
                                                <p className="text-xs font-semibold text-slate-500">{entry.answersCount} ответов</p>
                                            </div>
                                            <p className="text-lg font-black text-brand-700">{entry.score}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-5 rounded-2xl bg-white px-4 py-5 text-sm font-semibold text-slate-600">
                                    Организатор скрыл правильные ответы, баллы и общий рейтинг.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
                        <h3 className="text-lg font-black text-slate-950">Участники</h3>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {room.participants.map((participant) => (
                                <div key={participant.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                                    <span className="min-w-0 truncate font-bold text-slate-800">{participant.displayName}</span>
                                    {(showResults || isOrganizer) && (
                                        <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-black text-brand-700">
                                            {participant.score}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </DashboardPanel>
    );
}

export default LiveRoom;
