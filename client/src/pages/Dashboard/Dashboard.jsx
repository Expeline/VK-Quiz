import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";

const organizerLinks = [
    { label: "Мои квизы", to: "/dashboard/organizer/quizzes" },
    { label: "Создать квиз", to: "/dashboard/organizer/create" },
    { label: "История", to: "/dashboard/organizer/history" },
];

const participantLinks = [
    { label: "Присоединиться", to: "/dashboard/participant/join" },
    { label: "История игр", to: "/dashboard/participant/history" },
];

const accountLinks = [
    { label: "Профиль", to: "/dashboard/profile" },
];

function DashboardLink({ to, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                [
                    "shrink-0 rounded-2xl px-4 py-3 text-sm font-bold transition",
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
    const isOrganizer = user.role === ROLES.ORGANIZER;
    const links = isOrganizer ? organizerLinks : participantLinks;

    return (
        <section className="grid gap-4 lg:grid-cols-[18rem_1fr] lg:gap-6">
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:rounded-[2rem]">
                <div className="border-b border-slate-100 px-2 pb-4 sm:pb-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600 sm:text-sm sm:tracking-[0.18em]">Кабинет</p>
                    <h1 className="mt-2 truncate text-xl font-black text-slate-950 sm:text-2xl">{user.name}</h1>
                    <p className="mt-1 truncate text-sm text-slate-500">{user.email}</p>
                </div>

                <div className="mt-4 space-y-4 sm:mt-5 sm:space-y-6">
                    <nav className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
                        <p className="px-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                            {isOrganizer ? "Организатор" : "Участник"}
                        </p>
                        {links.map((link) => (
                            <DashboardLink key={link.to} {...link} />
                        ))}
                    </nav>

                    <nav className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
                        <p className="px-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                            Аккаунт
                        </p>
                        {accountLinks.map((link) => (
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
