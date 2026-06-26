import Button from "../../components/ui/Button";

function NotFound() {
    return (
        <main className="grid min-h-screen place-items-center px-4">
            <section className="max-w-md text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">404</p>
                <h1 className="mt-3 text-4xl font-black text-slate-950">Страница не найдена</h1>
                <p className="mt-4 text-slate-600">
                    Проверьте адрес или вернитесь на главную страницу приложения.
                </p>
                <Button to="/" className="mt-8">
                    На главную
                </Button>
            </section>
        </main>
    );
}

export default NotFound;
