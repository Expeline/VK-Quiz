import Button from "../../components/ui/Button";
import { ROLES } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";

const stages = [
    { title: "Соберите квиз", text: "Вопросы, изображения, варианты и правила хранятся в одном конструкторе." },
    { title: "Откройте комнату", text: "Участники заходят по коду, а организатор видит готовность аудитории." },
    { title: "Проведите игру", text: "Таймер, ответы, баллы и лидерборд синхронизируются в реальном времени." },
];

function Home() {
    const { user, isAuthenticated } = useAuth();
    const isOrganizer = user?.role === ROLES.ORGANIZER;

    return (
        <div className="space-y-14">
            <section className="grid min-h-[calc(100vh-9rem)] items-center gap-10 py-8 lg:grid-cols-[1fr_0.86fr]">
                <div className="max-w-3xl">
                    <p className="mb-5 inline-flex rounded-full border border-brand-100 bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm">
                        Платформа для live-квизов
                    </p>

                    <h1 className="text-5xl font-black leading-[1.05] tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
                        VK Quiz
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                        Создавайте интерактивные квизы, запускайте комнаты с таймером и получайте честный рейтинг участников сразу после игры.
                    </p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
                                <Button to="/register" size="lg">Начать</Button>
                                <Button to="/login" variant="secondary" size="lg">Войти</Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                    <div className="grid gap-4">
                        {stages.map((stage, index) => (
                            <article key={stage.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <div className="flex items-start gap-4">
                                    <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-600 text-lg font-black text-white">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-950">{stage.title}</h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">{stage.text}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
