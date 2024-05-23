import React, { useState, useEffect } from "react";

const TimerModal = ({ isOpen, onClose, setTimeLeft, timeLeft }) => {
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    if (timeLeft === 0) {
      setSelectedTime(null);
      setTimeLeft(null);
    }

    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTimeLeft) => {
          const newTime = prevTimeLeft - 1;
          localStorage.setItem("timeLeft", JSON.stringify(newTime));
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft, setTimeLeft]);

  const handleTimeSelection = (minutes) => {
    const newTime = minutes * 60;
    setSelectedTime(newTime);
    setTimeLeft(newTime);
    localStorage.setItem("timeLeft", JSON.stringify(newTime));
  };

  const adjustTime = (seconds) => {
    setTimeLeft((prevTime) => {
      const newTime = Math.max(prevTime + seconds, 0);
      localStorage.setItem("timeLeft", JSON.stringify(newTime));
      return newTime;
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toLocaleString(undefined, { minimumIntegerDigits: 2 })}:${secs.toLocaleString(undefined, { minimumIntegerDigits: 2 })}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
      onClick={onClose} // Close modal when clicking outside the content
    >
      <div
        className="bg-white p-4 rounded shadow-lg max-w-sm w-full h-2/3 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the content
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Select Timer</h2>
        {timeLeft !== null && (
          <div className="timer-display text-center text-4xl mb-4">
            {formatTime(timeLeft)}
          </div>
        )}
        <div className="flex flex-col justify-end space-y-4">
          <div className="timer-options flex justify-around mb-4">
            {!timeLeft
              ? [1, 2, 3, 4].map((minute) => (
                  <button
                    key={minute}
                    className="timer-button py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => handleTimeSelection(minute)}
                  >
                    {minute}:00
                  </button>
                ))
              : [-30, -15, 15, 30].map((sec) => (
                  <button
                    key={sec}
                    className={`timer-button py-2 px-4 ${
                      sec < 0 ? "bg-red-500" : "bg-green-500"
                    } text-white rounded hover:${
                      sec < 0 ? "bg-red-600" : "bg-green-600"
                    }`}
                    onClick={() => adjustTime(sec)}
                  >
                    {sec < 0 ? sec : `+${sec}`}
                  </button>
                ))}
          </div>
          <button
            onClick={onClose}
            className="close-button py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimerModal;
