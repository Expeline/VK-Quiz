import { useCallback, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import { useLanguage } from "../../hooks/useLanguage";
import { ConfirmContext } from "./confirmContext";

export function ConfirmProvider({ children }) {
    const { t } = useLanguage();
    const [confirmation, setConfirmation] = useState(null);

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setConfirmation({
                title: options.title,
                text: options.text,
                confirmLabel: options.confirmLabel,
                cancelLabel: options.cancelLabel,
                resolve,
            });
        });
    }, []);

    const close = (result) => {
        confirmation?.resolve(result);
        setConfirmation(null);
    };

    const value = useMemo(() => ({ confirm }), [confirm]);

    return (
        <ConfirmContext.Provider value={value}>
            {children}
            {confirmation && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/30">
                        <h2 className="text-xl font-black text-slate-950">{confirmation.title}</h2>
                        {confirmation.text && (
                            <p className="mt-2 text-sm leading-6 text-slate-600">{confirmation.text}</p>
                        )}
                        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button type="button" variant="secondary" onClick={() => close(false)}>
                                {confirmation.cancelLabel ?? t("common.cancel")}
                            </Button>
                            <Button type="button" variant="danger" onClick={() => close(true)}>
                                {confirmation.confirmLabel ?? t("common.confirm")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}
