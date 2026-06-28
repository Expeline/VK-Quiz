import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthCard from "../../components/AuthCard/AuthCard";
import { ROLES } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";

const initialForm = {
    name: "",
    email: "",
    password: "",
    role: ROLES.ORGANIZER,
};

function validateForm(form) {
    if (form.name.trim().length < 2) {
        return "Введите имя минимум из 2 символов.";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
        return "Введите корректный email.";
    }

    if (form.password.length < 6) {
        return "Пароль должен содержать минимум 6 символов.";
    }

    return "";
}

function getErrorMessage(error) {
    return error?.response?.data?.message ?? "Не удалось создать аккаунт. Проверьте доступность сервера и базы данных.";
}

function Register() {
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((currentForm) => ({ ...currentForm, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = validateForm(form);

        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            await register(form);
            navigate("/dashboard", { replace: true });
        } catch (submitError) {
            setError(getErrorMessage(submitError));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthCard
            title="Регистрация"
            subtitle="Создайте аккаунт для роли организатора или участника. Ролевая логика будет подключена на серверном этапе."
            submitLabel="Создать аккаунт"
            footerText="Уже есть аккаунт?"
            footerLinkLabel="Войти"
            footerLinkTo="/login"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
        >
            <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Имя</span>
                <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ваше имя"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
            </label>

            <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
            </label>

            <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Пароль</span>
                <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Не менее 8 символов"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
            </label>

            <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Роль</span>
                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                >
                    <option value={ROLES.ORGANIZER}>Организатор</option>
                    <option value={ROLES.PARTICIPANT}>Участник</option>
                </select>
            </label>
        </AuthCard>
    );
}

export default Register;
