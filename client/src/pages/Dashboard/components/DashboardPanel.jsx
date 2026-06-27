function DashboardPanel({ title, subtitle, children, action }) {
    return (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-950">{title}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p>
                </div>
                {action}
            </div>

            <div className="pt-6">{children}</div>
        </section>
    );
}

export default DashboardPanel;
