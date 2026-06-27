import DashboardPanel from "../../components/DashboardPanel";

function ParticipantHistory() {
    return (
        <DashboardPanel
            title="История игр"
            subtitle="После прохождения квизов здесь будут баллы, места в лидерборде и даты участия."
        >
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                История участника пока пуста.
            </div>
        </DashboardPanel>
    );
}

export default ParticipantHistory;
