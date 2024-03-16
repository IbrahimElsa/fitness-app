import React from "react";
import ReactDOM from "react-dom";

const Modal = ({ title, children, onClose }) => {
return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-4 rounded shadow-lg">
        <h4 className="text-lg font-bold mb-4">{title}</h4>
        {children}
        <button className="absolute top-0 right-0 m-2" onClick={onClose}>×</button>
        </div>
    </div>,
    document.getElementById('modal-root')
    );
};

export default Modal;
