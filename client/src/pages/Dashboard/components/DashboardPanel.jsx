function DashboardPanel({ title, subtitle, children, action }) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:rounded-[2rem] lg:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between sm:pb-6">
                <div className="min-w-0">
                    <h2 className="break-words text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{title}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p>
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>

            <div className="pt-5 sm:pt-6">{children}</div>
        </section>
    );
}

export default DashboardPanel;
