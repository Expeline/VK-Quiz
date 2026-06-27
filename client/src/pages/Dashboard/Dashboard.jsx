import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const organizerLinks = [
    { label: "Мои квизы", to: "/dashboard/organizer/quizzes" },
    { label: "Создать квиз", to: "/dashboard/organizer/create" },
    { label: "История", to: "/dashboard/organizer/history" },
];

const participantLinks = [
    { label: "Присоединиться", to: "/dashboard/participant/join" },
    { label: "История игр", to: "/dashboard/participant/history" },
    { label: "Профиль", to: "/dashboard/profile" },
];

function DashboardLink({ to, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                [
                    "rounded-2xl px-4 py-3 text-sm font-bold transition",
                    isActive
                        ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")
            }
        >
            {label}
        </NavLink>
    );
}

function Dashboard() {
    const { user } = useAuth();

    return (
        <section className="grid gap-6 lg:grid-cols-[18rem_1fr]">
            <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="border-b border-slate-100 px-2 pb-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Кабинет</p>
                    <h1 className="mt-2 text-2xl font-black text-slate-950">{user.name}</h1>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                </div>

                <div className="mt-5 space-y-6">
                    <nav className="grid gap-2">
                        <p className="px-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                            Организатор
                        </p>
                        {organizerLinks.map((link) => (
                            <DashboardLink key={link.to} {...link} />
                        ))}
                    </nav>

                    <nav className="grid gap-2">
                        <p className="px-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                            Участник
                        </p>
                        {participantLinks.map((link) => (
                            <DashboardLink key={link.to} {...link} />
                        ))}
                    </nav>
                </div>
            </aside>

            <div className="min-w-0">
                <Outlet />
            </div>
        </section>
    );
}

export default Dashboard;
