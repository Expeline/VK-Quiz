import { Link } from "react-router-dom";
import Button from "../ui/Button";

function AuthCard({ title, subtitle, submitLabel, footerText, footerLinkLabel, footerLinkTo, children }) {
    return (
        <section className="mx-auto grid min-h-[calc(100vh-9rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="hidden lg:block">
                <div className="max-w-lg">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
                        VK Quiz
                    </p>
                    <h1 className="text-4xl font-black leading-tight text-slate-950">
                        Единый вход для организаторов и участников квиза.
                    </h1>
                    <p className="mt-5 text-lg leading-8 text-slate-600">
                        Аккаунт понадобится для создания комнат, сохранения истории игр и отображения результатов в личном кабинете.
                    </p>
                </div>
            </div>

            <div className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70 sm:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-950">{title}</h1>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{subtitle}</p>
                </div>

                <form className="space-y-5">
                    {children}

                    <Button type="submit" className="w-full">
                        {submitLabel}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    {footerText}{" "}
                    <Link to={footerLinkTo} className="font-semibold text-brand-600 hover:text-brand-700">
                        {footerLinkLabel}
                    </Link>
                </p>
            </div>
        </section>
    );
}

export default AuthCard;
