import { useContext, createContext, useState, useCallback, useMemo } from "react";
import Toaster from "../components/Toaster";

const ToastContext = createContext<any>(null);

export function ToasterProvider({ children } : any) {
    const [toasts, setToasts] = useState<any>([]);
    const [toastId, setToastId] = useState(0);

    // useCallback ensures the function reference is stable across re-renders
    const addToast = useCallback((message : any, type = 'info', duration = 3000) => {
        const id = toastId;
        setToastId(prevId => prevId + 1);
        setToasts((currentToasts : any)=> [
            ...currentToasts,
            { id, message, type, duration },
        ]);
    }, [toastId]);

    const removeToast = useCallback((id : any) => {
        setToasts((currentToasts : any) => currentToasts.filter((toast : any) => toast.id !== id));
    }, []);

    // useMemo to prevent context value from changing on every render
    const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <Toaster toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export const useToaster = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToaster must be used within a ToasterProvider");
    }
    return context;
}
