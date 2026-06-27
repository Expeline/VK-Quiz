import Button from "../../../../components/ui/Button";
import DashboardPanel from "../../components/DashboardPanel";

const quizzes = [
    { title: "Web Basics", questions: 12, status: "Черновик" },
    { title: "JavaScript Live", questions: 18, status: "Готов к запуску" },
];

function OrganizerQuizzes() {
    return (
        <DashboardPanel
            title="Мои квизы"
            subtitle="Список квизов организатора. Позже здесь появятся действия запуска, редактирования и копирования комнаты."
            action={<Button to="/dashboard/organizer/create" size="sm">Создать квиз</Button>}
        >
            <div className="grid gap-4 md:grid-cols-2">
                {quizzes.map((quiz) => (
                    <article key={quiz.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-950">{quiz.title}</h3>
                                <p className="mt-2 text-sm text-slate-500">{quiz.questions} вопросов</p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-700 shadow-sm">
                                {quiz.status}
                            </span>
                        </div>
                    </article>
                ))}
            </div>
        </DashboardPanel>
    );
}

export default OrganizerQuizzes;
