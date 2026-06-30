import { useEffect, useState } from "react";
import { fetchParticipantHistory } from "../../../../api/roomApi";
import { useLanguage } from "../../../../hooks/useLanguage";
import DashboardPanel from "../../components/DashboardPanel";

function getErrorMessage(error) {
    return error?.response?.data?.message ?? "Не удалось загрузить историю.";
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

function getScoreClassName(percent) {
    if (percent >= 80) {
        return "bg-emerald-600 text-white";
    }

    if (percent >= 50) {
        return "bg-amber-500 text-white";
    }

    return "bg-red-600 text-white";
}

function ParticipantHistory() {
    const { t } = useLanguage();
    const [entries, setEntries] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadHistory() {
            setIsLoading(true);
            setError("");

            try {
                const loadedEntries = await fetchParticipantHistory();

                if (isMounted) {
                    setEntries(loadedEntries);
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(getErrorMessage(loadError));
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
    }, []);

    return (
        <DashboardPanel
            title={t("history.title")}
            subtitle={t("history.subtitle")}
        >
            {error && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            {isLoading ? (
                <p className="text-sm font-semibold text-slate-500">{t("history.loading")}</p>
            ) : entries.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                    {t("history.empty")}
                </div>
            ) : (
                <div className="grid gap-4">
                    {entries.map((entry) => {
                        const currentResult = entry.room.leaderboard.find((result) => result.participantId === entry.participantId);
                        const accuracyPercent = currentResult?.accuracyPercent ?? 0;

                        return (
                        <article key={entry.participantId} className="min-w-0 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <h3 className="break-words text-lg font-black text-slate-950 sm:text-xl">{entry.room.quiz.title}</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {t("history.answersAndCode", { answers: entry.answersCount, code: entry.room.code })}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {entry.place && (
                                        <span className="w-fit shrink-0 rounded-full bg-white px-3 py-1 text-sm font-black text-brand-700 shadow-sm">
                                            {t("history.place", { place: entry.place })}
                                        </span>
                                    )}
                                    <span className={[
                                        "w-fit shrink-0 rounded-full px-3 py-1 text-sm font-black shadow-sm",
                                        getScoreClassName(accuracyPercent),
                                    ].join(" ")}>
                                        {t("history.score", { score: entry.score })}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white sm:block">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-100 text-xs font-black uppercase text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">{t("history.placeColumn")}</th>
                                            <th className="px-4 py-3">{t("history.participantColumn")}</th>
                                            <th className="px-4 py-3">{t("history.correctColumn")}</th>
                                            <th className="px-4 py-3 text-right">{t("history.scoreColumn")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            ...entry.room.leaderboard.slice(0, 3),
                                            ...(entry.place > 3
                                                ? [entry.room.leaderboard.find((result) => result.participantId === entry.participantId)]
                                                : []),
                                        ].filter(Boolean).map((result) => (
                                            <tr
                                                key={result.participantId}
                                                className={[
                                                    "border-t border-slate-100",
                                                    result.participantId === entry.participantId ? "bg-brand-50" : "",
                                                ].join(" ")}
                                            >
                                                <td className="px-4 py-3 font-black text-brand-700">{result.place}</td>
                                                <td className="px-4 py-3 font-bold text-slate-800">{result.displayName}</td>
                                                <td className="px-4 py-3">
                                                    <span className={[
                                                        "rounded-full border px-3 py-1 text-xs font-black",
                                                        getAccuracyClassName(result.accuracyPercent ?? 0),
                                                    ].join(" ")}>
                                                        {result.accuracyPercent ?? 0}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-black text-slate-950">{result.score}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 grid gap-2 sm:hidden">
                                {[
                                    ...entry.room.leaderboard.slice(0, 3),
                                    ...(entry.place > 3
                                        ? [entry.room.leaderboard.find((result) => result.participantId === entry.participantId)]
                                        : []),
                                ].filter(Boolean).map((result) => (
                                    <div
                                        key={result.participantId}
                                        className={[
                                            "grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3",
                                            result.participantId === entry.participantId ? "border-brand-200 bg-brand-50" : "",
                                        ].join(" ")}
                                    >
                                        <span className="text-center font-black text-brand-700">{result.place}</span>
                                        <span className="min-w-0 truncate font-bold text-slate-800">{result.displayName}</span>
                                        <div className="text-right">
                                            <span className="block font-black text-slate-950">{result.score}</span>
                                            <span className={[
                                                "mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-black",
                                                getAccuracyClassName(result.accuracyPercent ?? 0),
                                            ].join(" ")}>
                                                {result.accuracyPercent ?? 0}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>
                        );
                    })}
                </div>
            )}
        </DashboardPanel>
    );
}

export default ParticipantHistory;
