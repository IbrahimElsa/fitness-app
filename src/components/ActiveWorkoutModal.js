import React from "react";
import ReactDOM from "react-dom";

const ActiveWorkoutModal = ({ show, title, children, onClose, shouldCloseOnOutsideClick = true }) => {
if (!show) {
    return null;
}

const handleOutsideClick = (event) => {
    if (shouldCloseOnOutsideClick && event.target.id === "modal-backdrop") {
        onClose();
    }
};

return ReactDOM.createPortal(
    <div id="modal-backdrop" className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={handleOutsideClick}>
        <div className="bg-white p-4 rounded shadow-lg" onClick={e => e.stopPropagation()}>
        <h4 className="text-lg font-bold mb-4">{title}</h4>
        {children}
        <button className="absolute top-0 right-0 m-2" onClick={onClose}>×</button>
        </div>
    </div>,
    document.getElementById('modal-root')
    );
};

export default ActiveWorkoutModal;
