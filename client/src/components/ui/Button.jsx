import { Link } from "react-router-dom";

const variants = {
    primary: "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700",
    secondary: "border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-brand-200 hover:bg-brand-50",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950",
};

const sizes = {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-7 text-base",
};

function Button({ children, to, type = "button", variant = "primary", size = "md", className = "" }) {
    const classes = [
        "inline-flex items-center justify-center rounded-full font-semibold transition focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60",
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
        <button type={type} className={classes}>
            {children}
        </button>
    );
}

export default Button;
