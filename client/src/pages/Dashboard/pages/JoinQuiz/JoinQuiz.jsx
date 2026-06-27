import Button from "../../../../components/ui/Button";
import DashboardPanel from "../../components/DashboardPanel";

function JoinQuiz() {
    return (
        <DashboardPanel
            title="Присоединиться по коду"
            subtitle="Участник вводит код комнаты и попадает в активный квиз после запуска организатором."
        >
            <form className="flex max-w-xl flex-col gap-3 sm:flex-row">
                <input
                    type="text"
                    placeholder="QZ-4821"
                    className="h-12 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 font-black uppercase tracking-[0.18em] outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
                <Button type="button">Войти в комнату</Button>
            </form>
        </DashboardPanel>
    );
}

export default JoinQuiz;
