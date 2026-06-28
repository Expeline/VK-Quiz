import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinRoom } from "../../../../api/roomApi";
import Button from "../../../../components/ui/Button";
import DashboardPanel from "../../components/DashboardPanel";

function getErrorMessage(error) {
    return error?.response?.data?.message ?? "Не удалось войти в комнату.";
}

function JoinQuiz() {
    const navigate = useNavigate();
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
        <DashboardPanel
            title="Присоединиться по коду"
            subtitle="Участник вводит код комнаты и попадает в активный квиз после запуска организатором."
        >
            {error && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            <form className="flex max-w-xl flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    placeholder="QZ-4821"
                    className="h-12 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 font-black uppercase tracking-[0.18em] outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
                <Button type="submit" disabled={!code.trim() || isSubmitting}>
                    {isSubmitting ? "Вход..." : "Войти в комнату"}
                </Button>
            </form>
        </DashboardPanel>
    );
}

export default JoinQuiz;
