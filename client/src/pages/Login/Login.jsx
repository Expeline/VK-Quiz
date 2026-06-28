import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../../components/AuthCard/AuthCard";
import { useAuth } from "../../hooks/useAuth";

const initialForm = {
    email: "",
    password: "",
};

function validateForm(form) {
    if (!form.email.trim()) {
        return "Введите email.";
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
    return error?.response?.data?.message ?? "Не удалось выполнить вход. Проверьте доступность сервера и базы данных.";
}

function Login() {
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from?.pathname ?? "/dashboard";

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
            await login(form);
            navigate(redirectTo, { replace: true });
        } catch (submitError) {
            setError(getErrorMessage(submitError));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthCard
            title="Вход"
            subtitle="Введите данные аккаунта, чтобы перейти к созданию квиза или подключиться к активной комнате."
            submitLabel="Войти"
            footerText="Еще нет аккаунта?"
            footerLinkLabel="Зарегистрироваться"
            footerLinkTo="/register"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
        >
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
                    placeholder="Введите пароль"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
            </label>
        </AuthCard>
    );
}

export default Login;
