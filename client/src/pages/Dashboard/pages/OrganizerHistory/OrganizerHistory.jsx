import { useEffect, useState } from "react";
import { fetchOrganizerHistory } from "../../../../api/roomApi";
import DashboardPanel from "../../components/DashboardPanel";

function getErrorMessage(error) {
    return error?.response?.data?.message ?? "Не удалось загрузить историю.";
}

function OrganizerHistory() {
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
            title="История проведенных квизов"
            subtitle="Результаты завершенных комнат, число участников и победители."
        >
            {error && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            {isLoading ? (
                <p className="text-sm font-semibold text-slate-500">Загрузка истории...</p>
            ) : rooms.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                    Проведенные игры появятся после завершения комнаты.
                </div>
            ) : (
                <div className="grid gap-4">
                    {rooms.map((room) => (
                        <article key={room.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-950">{room.quiz.title}</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Код {room.code}, участников: {room.participants.length}
                                    </p>
                                </div>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-700 shadow-sm">
                                    {room.endedAt ? new Date(room.endedAt).toLocaleDateString("ru-RU") : "Завершен"}
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
                                        {room.leaderboard.slice(0, 3).map((entry) => (
                                            <tr key={entry.participantId} className="border-t border-slate-100">
                                                <td className="px-4 py-3 font-black text-brand-700">{entry.place}</td>
                                                <td className="px-4 py-3 font-bold text-slate-800">{entry.displayName}</td>
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
