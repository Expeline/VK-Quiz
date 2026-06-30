import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../hooks/useLanguage";

function SunIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="none">
            <circle cx="12" cy="12" r="4.5" fill="currentColor" />
            <path
                d="M12 2.5v3M12 18.5v3M4.57 4.57l2.12 2.12M17.31 17.31l2.12 2.12M2.5 12h3M18.5 12h3M4.57 19.43l2.12-2.12M17.31 6.69l2.12-2.12"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2.6"
            />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="currentColor">
            <path d="M20.7 14.7A8.75 8.75 0 0 1 9.3 3.3a.8.8 0 0 0-1-.98 10.25 10.25 0 1 0 13.38 13.38.8.8 0 0 0-.98-1Z" />
        </svg>
    );
}

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const { t } = useLanguage();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-slate-950"
            aria-label={isDark ? t("theme.toLight") : t("theme.toDark")}
        >
            <span className="grid size-6 place-items-center rounded-full bg-brand-100 text-brand-700">
                {isDark ? <MoonIcon /> : <SunIcon />}
            </span>
            <span className="hidden sm:inline">{isDark ? t("theme.dark") : t("theme.light")}</span>
        </button>
    );
}

export default ThemeToggle;
