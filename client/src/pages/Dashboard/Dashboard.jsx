import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { ROLES } from "../../constants/roles";

const organizerLinks = [
    { labelKey: "dashboard.myQuizzes", to: "/dashboard/organizer/quizzes" },
    { labelKey: "dashboard.createQuiz", to: "/dashboard/organizer/create" },
    { labelKey: "dashboard.history", to: "/dashboard/organizer/history" },
];

const participantLinks = [
    { labelKey: "dashboard.join", to: "/dashboard/participant/join" },
    { labelKey: "dashboard.gameHistory", to: "/dashboard/participant/history" },
];

function DashboardLink({ to, labelKey }) {
    const { t } = useLanguage();

    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                [
                    "rounded-2xl px-4 py-3 text-center text-sm font-bold transition",
                    isActive
                        ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")
            }
        >
            {t(labelKey)}
        </NavLink>
    );
}

function Dashboard() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isOrganizer = user.role === ROLES.ORGANIZER;
    const links = isOrganizer ? organizerLinks : participantLinks;
    const avatarLetter = user.name?.slice(0, 1).toUpperCase() || "G";

    return (
        <section className="grid gap-4 lg:grid-cols-[18rem_1fr] lg:gap-6">
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:rounded-[2rem]">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-2 pb-4 sm:pb-5">
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-600">{t("dashboard.title")}</p>
                    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-100 text-base font-black text-brand-700">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                            avatarLetter
                        )}
                    </span>
                </div>

                <div className="mt-4 grid gap-4 sm:mt-5 lg:gap-6">
                    <nav className="grid gap-2">
                        <p className="px-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400 lg:px-2">
                            {isOrganizer ? t("dashboard.organizer") : t("dashboard.participant")}
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                            {links.map((link) => (
                                <DashboardLink key={link.to} {...link} />
                            ))}
                        </div>
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
