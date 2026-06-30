import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinRoom } from "../../../../api/roomApi";
import Button from "../../../../components/ui/Button";
import { useLanguage } from "../../../../hooks/useLanguage";

function getErrorMessage(error) {
    return error?.response?.data?.message ?? "Не удалось войти в комнату.";
}

function JoinQuiz() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const { room } = await joinRoom(code);
            navigate(`/dashboard/rooms/${room.id}`);
        } catch (joinError) {
            setError(getErrorMessage(joinError));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:rounded-[2rem] lg:p-7">
            <div>
                <h2 className="break-words text-xl font-black leading-tight text-slate-950 sm:text-2xl">
                    {t("join.title")}
                </h2>
            </div>

            {error && (
                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            <form className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    placeholder="QZ-4821"
                    className="h-12 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 font-black uppercase tracking-[0.18em] outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
                <Button type="submit" disabled={!code.trim() || isSubmitting}>
                    {isSubmitting ? t("join.submitting") : t("join.submit")}
                </Button>
            </form>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                {t("join.subtitle")}
            </p>
        </section>
    );
}

export default JoinQuiz;
