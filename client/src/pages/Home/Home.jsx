import Button from "../../components/ui/Button";

const benefits = [
    {
        title: "Реальное время",
        text: "Вопросы синхронно появляются у всех участников комнаты во время проведения квиза.",
    },
    {
        title: "Комнаты по коду",
        text: "Игроки подключаются к активному квизу быстро и без лишней настройки.",
    },
    {
        title: "Лидерборд",
        text: "Баллы считаются автоматически, а итоговая таблица показывает победителей сразу после игры.",
    },
    {
        title: "История игр",
        text: "Организаторы и участники смогут возвращаться к проведенным и пройденным квизам.",
    },
];

function Home() {
    return (
        <div className="space-y-20">
            <section className="grid min-h-[calc(100vh-9rem)] items-center gap-12 py-8 lg:grid-cols-[1.02fr_0.98fr]">
                <div className="max-w-2xl">
                    <p className="mb-5 inline-flex rounded-full border border-brand-100 bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm">
                        MVP для онлайн-квизов
                    </p>

                    <h1 className="text-5xl font-black leading-[1.05] tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
                        VK Quiz
                    </h1>

                    <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
                        Веб-приложение для создания, запуска и прохождения квизов в реальном времени с комнатами, таймерами и итоговым лидербордом.
                    </p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <Button to="/dashboard/organizer/create" size="lg">
                            Создать квиз
                        </Button>
                        <Button to="/dashboard/participant/join" variant="secondary" size="lg">
                            Присоединиться
                        </Button>
                    </div>
                </div>

                <div className="relative">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/80">
                        <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Комната</p>
                                    <p className="text-2xl font-black">QZ-4821</p>
                                </div>
                                <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-300">
                                    Live
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white p-5 text-slate-950">
                                <div className="mb-4 flex items-center justify-between text-sm font-semibold text-slate-500">
                                    <span>Вопрос 4 из 12</span>
                                    <span>00:21</span>
                                </div>
                                <h2 className="text-2xl font-black leading-tight">
                                    Какой протокол удобен для обновления вопросов в реальном времени?
                                </h2>
                                <div className="mt-5 grid gap-3">
                                    {["HTTP", "WebSocket", "SMTP", "FTP"].map((answer) => (
                                        <div
                                            key={answer}
                                            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold"
                                        >
                                            {answer}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {benefits.map((benefit) => (
                    <article key={benefit.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-black text-slate-950">{benefit.title}</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{benefit.text}</p>
                    </article>
                ))}
            </section>
        </div>
    );
}

export default Home;
