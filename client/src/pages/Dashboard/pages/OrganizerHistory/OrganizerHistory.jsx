import { useEffect, useState } from "react";
import { fetchOrganizerHistory } from "../../../../api/roomApi";
import { useLanguage } from "../../../../hooks/useLanguage";
import DashboardPanel from "../../components/DashboardPanel";

function getErrorMessage(error, fallback) {
    return error?.response?.data?.message ?? fallback;
}

function getAccuracyClassName(percent) {
    if (percent >= 80) {
        return "bg-emerald-50 text-emerald-800 border-emerald-100";
    }

    if (percent >= 50) {
        return "bg-amber-50 text-amber-800 border-amber-100";
    }

    return "bg-red-50 text-red-800 border-red-100";
}

function OrganizerHistory() {
    const { t, language } = useLanguage();
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadHistory() {
            setIsLoading(true);
            setError("");

            try {
                const loadedRooms = await fetchOrganizerHistory();

                if (isMounted) {
                    setRooms(loadedRooms);
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(getErrorMessage(loadError, t("organizerHistory.error")));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadHistory();

        return () => {
            isMounted = false;
        };
    }, [t]);

    return (
        <DashboardPanel
            title={t("organizerHistory.title")}
            subtitle={t("organizerHistory.subtitle")}
        >
            {error && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            {isLoading ? (
                <p className="text-sm font-semibold text-slate-500">{t("history.loading")}</p>
            ) : rooms.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                    {t("organizerHistory.empty")}
                </div>
            ) : (
                <div className="grid gap-4">
                    {rooms.map((room) => (
                        <article key={room.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <h3 className="break-words text-lg font-black text-slate-950 sm:text-xl">{room.quiz.title}</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {t("organizerHistory.roomInfo", { code: room.code, count: room.participants.length })}
                                    </p>
                                </div>
                                <span className="w-fit shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-700 shadow-sm">
                                    {room.endedAt ? new Date(room.endedAt).toLocaleDateString(language) : t("organizerHistory.finished")}
                                </span>
                            </div>
                            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                                <table className="w-full min-w-[28rem] text-left text-sm">
                                    <thead className="bg-slate-100 text-xs font-black uppercase text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">{t("history.placeColumn")}</th>
                                            <th className="px-4 py-3">{t("history.participantColumn")}</th>
                                            <th className="px-4 py-3">{t("history.correctColumn")}</th>
                                            <th className="px-4 py-3 text-right">{t("history.scoreColumn")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {room.leaderboard.slice(0, 3).map((entry) => (
                                            <tr key={entry.participantId} className="border-t border-slate-100">
                                                <td className="px-4 py-3 font-black text-brand-700">{entry.place}</td>
                                                <td className="px-4 py-3 font-bold text-slate-800">{entry.displayName}</td>
                                                <td className="px-4 py-3">
                                                    <span className={[
                                                        "rounded-full border px-3 py-1 text-xs font-black",
                                                        getAccuracyClassName(entry.accuracyPercent ?? 0),
                                                    ].join(" ")}>
                                                        {entry.accuracyPercent ?? 0}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-black text-slate-950">{entry.score}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </DashboardPanel>
    );
}

export default OrganizerHistory;
