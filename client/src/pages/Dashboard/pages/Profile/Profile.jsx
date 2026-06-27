import DashboardPanel from "../../components/DashboardPanel";
import { useAuth } from "../../../../hooks/useAuth";

function Profile() {
    const { user } = useAuth();

    return (
        <DashboardPanel
            title="Профиль"
            subtitle="Базовые данные пользователя для будущего редактирования профиля и роли."
        >
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-500">Имя</p>
                    <p className="mt-2 text-lg font-black text-slate-950">{user.name}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-500">Email</p>
                    <p className="mt-2 break-all text-lg font-black text-slate-950">{user.email}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-500">Роль</p>
                    <p className="mt-2 text-lg font-black text-slate-950">{user.role}</p>
                </div>
            </div>
        </DashboardPanel>
    );
}

export default Profile;
