import { Link, NavLink } from "react-router-dom";
import Logo from "../ui/Logo";
import Button from "../ui/Button";

const navigation = [
    { label: "Главная", to: "/" },
    { label: "Кабинет", to: "/dashboard" },
];

function Navbar() {
    return (
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
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
                                        ? "bg-white text-brand-700 shadow-sm"
                                        : "text-slate-600 hover:text-slate-950",
                                ].join(" ")
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        to="/login"
                        className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
                    >
                        Войти
                    </Link>

                    <Button to="/register" size="sm">
                        Регистрация
                    </Button>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
