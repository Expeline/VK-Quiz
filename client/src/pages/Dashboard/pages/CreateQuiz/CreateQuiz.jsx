import Button from "../../../../components/ui/Button";
import DashboardPanel from "../../components/DashboardPanel";

function CreateQuiz() {
    return (
        <DashboardPanel
            title="Создать квиз"
            subtitle="Каркас формы создания квиза: название, категория, таймер, правила и будущие вопросы."
        >
            <form className="grid gap-5">
                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Название квиза</span>
                    <input
                        type="text"
                        placeholder="Например: Frontend Battle"
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                    />
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Категория</span>
                        <select className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10">
                            <option>Веб-разработка</option>
                            <option>История</option>
                            <option>Наука</option>
                            <option>Кино</option>
                        </select>
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Время на вопрос</span>
                        <select className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10">
                            <option>15 секунд</option>
                            <option>30 секунд</option>
                            <option>60 секунд</option>
                        </select>
                    </label>
                </div>

                <Button type="button" className="w-fit">
                    Сохранить черновик
                </Button>
            </form>
        </DashboardPanel>
    );
}

export default CreateQuiz;
