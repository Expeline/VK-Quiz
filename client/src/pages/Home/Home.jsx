import Button from "../../components/ui/Button";
import { ROLES } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";

const leaderboard = [
    { name: "Алина", avatar: "🧠", quizzes: 42, score: 9840, color: "bg-emerald-500" },
    { name: "Марк", avatar: "🥝", quizzes: 37, score: 9160, color: "bg-lime-500" },
    { name: "София", avatar: "🌵", quizzes: 31, score: 8720, color: "bg-teal-500" },
    { name: "Илья", avatar: "🚀", quizzes: 28, score: 8010, color: "bg-green-600" },
];

const stages = [
    { title: "Соберите раунд", text: "Добавьте вопросы, картинки, варианты и настройте показ правильных ответов." },
    { title: "Запустите аудиторию", text: "Комната откроется по коду, а старт станет доступен после входа участников." },
    { title: "Разберите итог", text: "Система покажет топ игроков, личное место и сохранит историю прохождения." },
];

function Home() {
    const { user, isAuthenticated } = useAuth();
    const isOrganizer = user?.role === ROLES.ORGANIZER;

    return (
        <div>
            <section className="grid min-h-[calc(100svh-7rem)] min-w-0 items-center gap-5 overflow-hidden sm:min-h-[calc(100vh-7rem)]">
                <div className="grid min-w-0 max-w-full items-center gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.88fr)] lg:gap-6">
                <div className="min-w-0 max-w-3xl animate-soft-rise">
                    <h1 className="text-4xl font-black leading-[1.04] tracking-normal text-slate-950 min-[380px]:text-5xl sm:text-6xl lg:text-7xl">
                        Green Quiz
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-lg sm:leading-7">
                        Проводите квизы в реальном времени: участники входят по коду, отвечают на таймере, а результаты собираются в понятный лидерборд.
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        {isAuthenticated ? (
                            isOrganizer ? (
                                <>
                                    <Button to="/dashboard/organizer/quizzes" size="lg">Мои квизы</Button>
                                    <Button to="/dashboard/organizer/create" variant="secondary" size="lg">Создать квиз</Button>
                                </>
                            ) : (
                                <>
                                    <Button to="/dashboard/participant/join" size="lg">Войти по коду</Button>
                                    <Button to="/dashboard/participant/history" variant="secondary" size="lg">Моя история</Button>
                                </>
                            )
                        ) : (
                            <>
                                <Button to="/register" size="lg">Начать игру</Button>
                                <Button to="/login" variant="secondary" size="lg">Войти</Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="min-w-0 animate-soft-rise rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-200/70 [animation-delay:120ms] sm:rounded-[2rem] sm:p-4">
                    <div className="rounded-3xl border border-brand-100 bg-brand-50 p-3 sm:rounded-[1.5rem] sm:p-4">
                        <div className="flex items-start justify-between gap-3 sm:items-center sm:gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-700 sm:text-sm sm:tracking-[0.16em]">Лидерборд недели</p>
                                <h2 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">Самые активные участники</h2>
                            </div>
                            <div className="rounded-full bg-white px-3 py-1 text-xs font-black text-brand-700 shadow-sm sm:text-sm">
                                Live
                            </div>
                        </div>

                        <div className="mt-4 grid gap-2.5">
                            {leaderboard.map((entry, index) => (
                                <article
                                    key={entry.name}
                                    className="group rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg sm:rounded-3xl sm:p-3.5"
                                >
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-5 text-center text-base font-black text-brand-700 sm:w-8 sm:text-lg">{index + 1}</div>
                                        <div className={`grid size-9 shrink-0 place-items-center rounded-full ${entry.color} text-lg font-black text-white shadow-lg shadow-brand-600/20 sm:size-10 sm:text-xl`}>
                                            {entry.avatar}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-3">
                                                <h3 className="truncate font-black text-slate-950">{entry.name}</h3>
                                                <span className="hidden shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 min-[420px]:inline">
                                                    {entry.quizzes} квизов
                                                </span>
                                            </div>
                                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-brand-600 transition-all duration-700 group-hover:bg-brand-500"
                                                    style={{ width: `${Math.min(100, entry.quizzes * 2.2)}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-base font-black text-slate-950 sm:text-lg">{entry.score}</p>
                                            <p className="text-xs font-semibold text-slate-500">баллов</p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
                </div>

                <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                    {stages.map((stage, index) => (
                        <article
                            key={stage.title}
                            className="animate-soft-rise rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl sm:rounded-3xl"
                            style={{ animationDelay: `${index * 90}ms` }}
                        >
                            <div className="grid size-10 place-items-center rounded-2xl bg-brand-600 text-base font-black text-white">
                                {index + 1}
                            </div>
                            <h2 className="mt-3 text-lg font-black text-slate-950">{stage.title}</h2>
                            <p className="mt-1.5 text-sm leading-6 text-slate-600">{stage.text}</p>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Home;
