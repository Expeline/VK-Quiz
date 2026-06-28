function Logo() {
    return (
        <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-brand-600 text-sm font-black text-white shadow-lg shadow-brand-600/25">
                GQ
            </div>
            <div className="leading-tight">
                <div className="text-base font-black tracking-normal text-slate-950">Green Quiz</div>
                <div className="text-xs font-medium text-slate-500">live rooms</div>
            </div>
        </div>
    );
}

export default Logo;
