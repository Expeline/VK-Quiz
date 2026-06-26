import AuthCard from "../../components/AuthCard/AuthCard";

function Register() {
    return (
        <AuthCard
            title="Регистрация"
            subtitle="Создайте аккаунт для роли организатора или участника. Ролевая логика будет подключена на серверном этапе."
            submitLabel="Создать аккаунт"
            footerText="Уже есть аккаунт?"
            footerLinkLabel="Войти"
            footerLinkTo="/login"
        >
            <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Имя</span>
                <input
                    type="text"
                    placeholder="Ваше имя"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
            </label>

            <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                <input
                    type="email"
                    placeholder="name@example.com"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
            </label>

            <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Пароль</span>
                <input
                    type="password"
                    placeholder="Не менее 8 символов"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
            </label>
        </AuthCard>
    );
}

export default Register;
