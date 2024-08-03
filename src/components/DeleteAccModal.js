import React from "react";
import ReactDOM from "react-dom";
import { useTheme } from "../components/ThemeContext";

const DeleteAccModal = ({
    title,
    onClose,
    isGoogleUser,
    password,
    setPassword,
    confirmText,
    setConfirmText,
    handleDeleteAccount,
    error
}) => {
    const { theme, themeCss } = useTheme();

    return ReactDOM.createPortal(
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ${themeCss[theme]}`}>
            <div className={`p-6 rounded shadow-lg relative ${theme === 'light' ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}>
                <h4 className="text-lg font-bold mb-4">{title}</h4>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {isGoogleUser ? (
                    <div>
                        <p className="mb-2">Please type "delete my account" to confirm:</p>
                        <input
                            type="text"
                            placeholder='Type "delete my account"'
                            className="p-2 border rounded w-full mb-4"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                        />
                    </div>
                ) : (
                    <div>
                        <p className="mb-2">Please enter your password to confirm deletion:</p>
                        <input
                            type="password"
                            placeholder="Password"
                            className="p-2 border rounded w-full mb-4"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                )}
                <div className="flex justify-end">
                    <button
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
                        onClick={handleDeleteAccount}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default DeleteAccModal;
