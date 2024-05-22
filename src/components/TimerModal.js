// TimerModal.js
import React, { useState, useEffect } from "react";

const TimerModal = ({ isOpen, onClose }) => {
  const [selectedTime, setSelectedTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (timeLeft === 0) {
      alert("Time's up!");
      setSelectedTime(null);
      setTimeLeft(null);
    }

    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft]);

  const handleTimeSelection = (minutes) => {
    setSelectedTime(minutes * 60);
    setTimeLeft(minutes * 60);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toLocaleString(undefined, { minimumIntegerDigits: 2 })}:${secs.toLocaleString(undefined, { minimumIntegerDigits: 2 })}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4">Select Timer</h2>
        <div className="timer-options flex justify-between mb-4">
          {[1, 2, 3, 4].map((minute) => (
            <button
              key={minute}
              className="timer-button py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleTimeSelection(minute)}
            >
              {minute} Minute{minute > 1 ? "s" : ""}
            </button>
          ))}
        </div>
        {timeLeft !== null && (
          <div className="timer-display text-center text-2xl mb-4">
            {formatTime(timeLeft)}
          </div>
        )}
        <button
          onClick={onClose}
          className="close-button py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default TimerModal;
