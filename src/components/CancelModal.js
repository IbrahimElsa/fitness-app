import React from "react";

const CancelModal = ({ onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full" id="cancelModal">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Cancel Workout</h3>
                <div className="mt-2 px-7 py-3">
                    <p className="text-sm text-gray-500">
                    Are you sure you want to cancel your workout? All progress will be lost.
                    </p>
                </div>
            <div className="items-center px-4 py-3">
                <button
                id="cancelButton"
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 mr-2"
                onClick={onClose}
                >
                No, Keep Going
                </button>
                <button
                id="confirmButton"
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={onConfirm}
                >
                Yes, Cancel
                </button>
                </div>
            </div>
        </div>
    </div>
    );
};

export default CancelModal;
