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
            <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <Link to="/" className="shrink-0">
                    <Logo />
                </Link>

                <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 md:flex">
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

                <div className="flex items-center gap-2">
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
                            <Button
                                to="/login"
                                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
                                size="sm"
                            >
                                Войти
                            </Button>

                            <Button to="/register" size="sm">
                                Регистрация
                            </Button>
                        </>
                    )}
                </div>
            </nav>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-500/35 to-transparent" />
        </header>
    );
}

export default Navbar;
