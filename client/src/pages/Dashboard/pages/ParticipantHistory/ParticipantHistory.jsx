import { useEffect, useState } from "react";
import { fetchParticipantHistory } from "../../../../api/roomApi";
import DashboardPanel from "../../components/DashboardPanel";

function getErrorMessage(error) {
    return error?.response?.data?.message ?? "Не удалось загрузить историю.";
}

function ParticipantHistory() {
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
            title="История игр"
            subtitle="После прохождения квизов здесь будут баллы, места в лидерборде и даты участия."
        >
            {error && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            {isLoading ? (
                <p className="text-sm font-semibold text-slate-500">Загрузка истории...</p>
            ) : entries.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                    История участника пока пуста.
                </div>
            ) : (
                <div className="grid gap-4">
                    {entries.map((entry) => (
                        <article key={entry.participantId} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-950">{entry.room.quiz.title}</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Ответов: {entry.answersCount}, код комнаты: {entry.room.code}
                                    </p>
                                </div>
                                <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-brand-700 shadow-sm">
                                    {entry.place ? `${entry.place} место` : `${entry.score} баллов`}
                                </span>
                            </div>
                            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-100 text-xs font-black uppercase text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">Место</th>
                                            <th className="px-4 py-3">Участник</th>
                                            <th className="px-4 py-3 text-right">Баллы</th>
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
                                                <td className="px-4 py-3 text-right font-black text-slate-950">{result.score}</td>
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

export default ParticipantHistory;
