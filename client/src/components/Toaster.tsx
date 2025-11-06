import { useEffect, useState } from 'react';
import './Toaster.css';

const Toast = ({ id, message, type, duration, onClose } : any) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Set a timer to automatically close the toast
        const timer = setTimeout(() => {
            setIsExiting(true);
            // Wait for the exit animation to finish before removing the toast
            setTimeout(onClose, 400);
        }, duration);

        return () => {
            clearTimeout(timer);
        };
    }, [id, duration, onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 400);
    };

    const toastClasses = `toast toast-${type} ${isExiting ? 'exit' : ''}`;

    return (
        <div className={toastClasses}>
            <span className="toast-message">{message}</span>
            <button onClick={handleClose} className="toast-close-btn">&times;</button>
        </div>
    );
}

const Toaster = ({ toasts, removeToast } : any) => {
    return (
        <div className="toaster-container">
            {toasts.map((toast : any) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

export default Toaster;