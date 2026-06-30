import { Link } from "react-router-dom";

const variants = {
    primary: "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700",
    secondary: "border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-brand-500 hover:bg-brand-100 hover:text-brand-900",
    ghost: "bg-transparent text-slate-700 hover:bg-brand-100 hover:text-brand-900",
    danger: "border border-red-200 bg-red-50 text-red-700 shadow-sm hover:border-red-300 hover:bg-red-100 hover:text-red-800",
};

const sizes = {
    sm: "min-h-10 px-4 py-2 text-sm",
    md: "min-h-12 px-5 py-2.5 text-base sm:px-6",
    lg: "min-h-12 px-5 py-3 text-base sm:min-h-14 sm:px-7",
};

function Button({ children, to, type = "button", variant = "primary", size = "md", className = "", disabled = false, onClick }) {
    const classes = [
        "inline-flex min-w-0 items-center justify-center rounded-full text-center font-semibold leading-tight transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
        variants[variant],
        sizes[size],
        className,
    ].join(" ");

    if (to) {
        return (
            <Link to={to} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} className={classes} disabled={disabled} onClick={onClick}>
            {children}
        </button>
    );
}

export default Button;
