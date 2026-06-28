import { useState } from "react";
import { uploadImage } from "../../../../api/uploadApi";
import Button from "../../../../components/ui/Button";
import { useAuth } from "../../../../hooks/useAuth";
import DashboardPanel from "../../components/DashboardPanel";

function getErrorMessage(error) {
    return error?.response?.data?.message ?? "Не удалось сохранить профиль.";
}

function Profile() {
    const { user, updateProfile } = useAuth();
    const [form, setForm] = useState({
        name: user.name,
        avatarUrl: user.avatarUrl ?? "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleAvatarFile = async (file) => {
        if (!file?.type.startsWith("image/")) {
            return;
        }

        setIsUploading(true);
        setError("");

        try {
            const avatarUrl = await uploadImage(file);
            setForm((currentForm) => ({ ...currentForm, avatarUrl }));
        } catch (uploadError) {
            setError(getErrorMessage(uploadError));
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setIsSaving(true);

        try {
            await updateProfile(form);
            setSuccess("Профиль сохранен.");
        } catch (submitError) {
            setError(getErrorMessage(submitError));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardPanel
            title="Профиль"
            subtitle="Измените имя и аватарку, которые видят другие участники комнаты."
        >
            <form className="grid gap-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {success}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
                        <div className="mx-auto grid size-28 place-items-center overflow-hidden rounded-full bg-brand-100 text-4xl font-black text-brand-700">
                            {form.avatarUrl ? (
                                <img src={form.avatarUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                                form.name.slice(0, 1).toUpperCase()
                            )}
                        </div>
                        <label className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-brand-200 hover:bg-brand-50">
                            {isUploading ? "Загрузка..." : "Выбрать аватар"}
                            <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(event) => handleAvatarFile(event.target.files[0])}
                            />
                        </label>
                    </div>

                    <div className="grid gap-5">
                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-slate-700">Имя</span>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(event) => setForm((currentForm) => ({ ...currentForm, name: event.target.value }))}
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                            />
                        </label>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-sm font-semibold text-slate-500">Email</p>
                                <p className="mt-2 break-all text-lg font-black text-slate-950">{user.email}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-sm font-semibold text-slate-500">Роль</p>
                                <p className="mt-2 text-lg font-black text-slate-950">{user.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Button type="submit" className="w-fit" disabled={isSaving || isUploading}>
                    {isSaving ? "Сохранение..." : "Сохранить профиль"}
                </Button>
            </form>
        </DashboardPanel>
    );
}

export default Profile;
