import { Link, NavLink } from "react-router-dom";
import Logo from "../ui/Logo";
import Button from "../ui/Button";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { useAuth } from "../../hooks/useAuth";

const guestNavigation = [{ label: "Главная", to: "/" }];

const userNavigation = [
    { label: "Главная", to: "/" },
    { label: "Кабинет", to: "/dashboard" },
];

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigation = isAuthenticated ? userNavigation : guestNavigation;

    return (
        <header className="app-navbar relative sticky top-0 z-30 backdrop-blur-md">
            <nav className="mx-auto box-border flex min-h-16 w-screen max-w-screen items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 lg:px-8 xl:max-w-7xl">
                <Link to="/" className="min-w-0 shrink-0">
                    <Logo />
                </Link>

                <div className="desktop-nav-pill items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 md:flex">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                [
                                    "rounded-full px-4 py-2 text-sm font-medium transition",
                                    isActive
                                        ? "bg-brand-600 text-white shadow-sm"
                                        : "text-slate-600 hover:bg-brand-100 hover:text-brand-800",
                                ].join(" ")
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <ThemeToggle />

                    {isAuthenticated ? (
                        <>
                            <div className="hidden items-center gap-3 sm:flex">
                                <div className="grid size-10 place-items-center rounded-full bg-slate-100 text-sm font-black text-brand-700">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        user.name.slice(0, 1).toUpperCase()
                                    )}
                                </div>
                                <div className="hidden leading-tight lg:block">
                                    <div className="text-sm font-bold text-slate-950">{user.name}</div>
                                    <div className="text-xs font-medium text-slate-500">{user.role}</div>
                                </div>
                            </div>

                            <Button variant="secondary" size="sm" onClick={logout}>
                                Выйти
                            </Button>
                        </>
                    ) : (
                        <>
                            <span className="hidden sm:inline-flex">
                                <Button
                                    to="/login"
                                    className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                                    size="sm"
                                >
                                    Войти
                                </Button>
                            </span>

                            <Button to="/register" size="sm">
                                <span className="sm:hidden">Старт</span>
                                <span className="hidden sm:inline">Регистрация</span>
                            </Button>
                        </>
                    )}
                </div>
            </nav>
            <div className="mx-auto box-border flex w-screen max-w-screen gap-2 overflow-x-auto px-3 pb-2 md:hidden xl:max-w-7xl">
                {navigation.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            [
                                "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition",
                                isActive
                                    ? "bg-brand-600 text-white shadow-sm"
                                    : "border border-slate-200 bg-white/85 text-slate-700 hover:bg-brand-50 hover:text-brand-800",
                            ].join(" ")
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-500/35 to-transparent" />
        </header>
    );
}

export default Navbar;
