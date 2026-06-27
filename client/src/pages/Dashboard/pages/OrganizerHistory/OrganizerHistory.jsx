import DashboardPanel from "../../components/DashboardPanel";

function OrganizerHistory() {
    return (
        <DashboardPanel
            title="История проведенных квизов"
            subtitle="Здесь будут результаты комнат, дата проведения, число участников и победители."
        >
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                Проведенные игры появятся после подключения API.
            </div>
        </DashboardPanel>
    );
}

export default OrganizerHistory;
