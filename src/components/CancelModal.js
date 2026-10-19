import React, { useEffect } from "react";
import { useTheme } from "../components/ThemeContext";

// Generic confirmation dialog. Defaults match its original use (cancelling an
// active workout); pass title/message/labels to reuse it elsewhere.
const CancelModal = ({
  onConfirm,
  onClose,
  title = "Cancel Workout",
  message = "Are you sure you want to cancel your workout? All progress will be lost.",
  confirmLabel = "Yes, Cancel",
  cancelLabel = "No, Keep Going",
}) => {
  const { theme } = useTheme();

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50"
      id="cancelModal"
      onClick={onClose}
    >
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancelModalTitle"
            className={`relative top-20 mx-auto p-5 border w-11/12 max-w-sm shadow-lg rounded-xl ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="mt-3 text-center">
                <h3 id="cancelModalTitle" className={`text-lg leading-6 font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{title}</h3>
                <div className="mt-2 px-7 py-3">
                    <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-300'}`}>
                    {message}
                    </p>
                </div>
                <div className="items-center px-4 py-3">
                    <button
                        id="cancelButton"
                        className={`px-4 py-2 rounded-full mr-2 ${theme === 'light' ? 'bg-slate-200 hover:bg-slate-300 text-slate-900' : 'bg-slate-600 hover:bg-slate-500 text-white'}`}
                        onClick={onClose}
                    >
                    {cancelLabel}
                    </button>
                    <button
                        id="confirmButton"
                        className="px-4 py-2 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                        onClick={onConfirm}
                    >
                    {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CancelModal;
