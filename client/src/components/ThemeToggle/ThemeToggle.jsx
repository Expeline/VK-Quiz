import { useTheme } from "../../hooks/useTheme";

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-slate-950"
            aria-label={isDark ? "Включить светлую тему" : "Включить темную тему"}
        >
            <span className="grid size-6 place-items-center rounded-full bg-brand-100 text-xs text-brand-700">
                {isDark ? "☾" : "☀"}
            </span>
            <span className="hidden sm:inline">{isDark ? "Темная" : "Светлая"}</span>
        </button>
    );
}

export default ThemeToggle;
