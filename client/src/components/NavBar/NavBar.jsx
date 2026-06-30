import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";

const guestNavigation = [
    { labelKey: "nav.home", to: "/" },
];

const userNavigation = [
    { labelKey: "nav.home", to: "/" },
    { labelKey: "nav.dashboard", to: "/dashboard" },
    { labelKey: "nav.profile", to: "/profile" },
];

function Navbar() {
    const { isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const navigation = isAuthenticated ? userNavigation : guestNavigation;

    const getNavClassName = ({ isActive }) =>
        [
            "nav-link rounded-full px-4 py-2 text-sm font-black transition-all duration-300 ease-out",
            "hover:-translate-y-0.5 hover:bg-brand-100 hover:text-brand-800",
            isActive ? "nav-link-active bg-brand-600 text-white shadow-lg shadow-brand-600/20" : "text-slate-600",
        ].join(" ");

    const getMobileNavClassName = ({ isActive }) =>
        [
            "nav-link grid min-h-12 place-items-center rounded-2xl px-2 py-2 text-center text-sm font-black transition-all duration-300 ease-out",
            "hover:bg-brand-50 hover:text-brand-800 active:scale-[0.98]",
            isActive ? "nav-link-active bg-brand-600 text-white shadow-lg shadow-brand-600/25" : "text-slate-600",
        ].join(" ");

    return (
        <>
        <header className="app-navbar relative sticky top-0 z-30 hidden backdrop-blur-md lg:block">
            <nav className="mx-auto box-border grid min-h-16 max-w-7xl place-items-center px-8 py-2">
                <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={getNavClassName}
                        >
                            {t(item.labelKey)}
                        </NavLink>
                    ))}
                </div>
            </nav>
        </header>

        <nav
            className="fixed bottom-3 left-5 right-5 z-40 grid gap-1 rounded-3xl border border-slate-200 bg-white/92 p-1.5 shadow-2xl shadow-slate-900/15 backdrop-blur-xl lg:hidden"
            style={{ gridTemplateColumns: `repeat(${navigation.length}, minmax(0, 1fr))` }}
        >
            {navigation.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={getMobileNavClassName}
                >
                    {t(item.labelKey)}
                </NavLink>
            ))}
        </nav>
        </>
    );
}

export default Navbar;
