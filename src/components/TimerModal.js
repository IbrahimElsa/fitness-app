import React, { useEffect, useRef, useCallback } from "react";
import { useTheme } from "../components/ThemeContext";

const TimerModal = ({ isOpen, onClose, timeLeft, setTimeLeft }) => {
  const { theme, themeCss } = useTheme();
  const intervalRef = useRef(null);

  // We'll keep track of the last "full minute" we used for sending
  // a time-update notification so we don't spam notifications every second.
  const lastMinuteRef = useRef(null);
  
  // Clean up function to properly reset all timer resources
  const cleanupTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    localStorage.removeItem("timerEndTime");
  }, []);

  // Load timer state from localStorage
  const loadTimerState = useCallback(() => {
    const savedEndTime = localStorage.getItem("timerEndTime");
    if (savedEndTime) {
      const now = Date.now();
      const end = parseInt(savedEndTime, 10);
      if (end > now) {
        const remainingTime = Math.ceil((end - now) / 1000);
        setTimeLeft(remainingTime);
      } else {
        setTimeLeft(0);
        cleanupTimer();
      }
    }
  }, [setTimeLeft, cleanupTimer]);

  // Initialize notifications and load timer state
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    };

    requestNotificationPermission();
    loadTimerState();

    // Add a beforeunload event listener to ensure state is saved when tab closes
    const handleBeforeUnload = () => {
      if (timeLeft > 0) {
        const endTime = Date.now() + (timeLeft * 1000);
        localStorage.setItem("timerEndTime", endTime.toString());
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [loadTimerState, timeLeft]);

  // Timer interval setup and management
  useEffect(() => {
    // If timer is already running, clear it before setting up a new one
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTimeLeft) => {
          if (prevTimeLeft <= 1) {
            cleanupTimer();
            // Timer is done
            sendNotification("Timer Complete", "Your timer has finished!", "timer-notification");
            return 0;
          }

          const newTimeLeft = prevTimeLeft - 1;

          // Send time-update notifications at appropriate intervals
          const minutes = Math.floor(newTimeLeft / 60);
          const seconds = newTimeLeft % 60;

          if (
            Notification.permission === "granted" &&
            (seconds === 0 || newTimeLeft < 60)
          ) {
            // Only send once per new "minutes" value,
            // or if we have < 60 seconds left, we can send every 15 seconds to avoid spam
            if ((newTimeLeft < 60 && seconds % 15 === 0) || lastMinuteRef.current !== minutes) {
              lastMinuteRef.current = minutes;
              sendNotification(
                "Time Update",
                `${formatTime(newTimeLeft)} remaining`,
                "timer-notification"
              );
            }
          }

          return newTimeLeft;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timeLeft, setTimeLeft, cleanupTimer]);

  const sendNotification = (title, body, tag) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        tag,        // Provide a tag so the OS/browser can group or replace
        renotify: true, // Allows the notification to update rather than stack
      });
    }
  };

  const handleTimeSelection = (minutes) => {
    const newTimeLeft = minutes * 60;
    const newEndTime = Date.now() + newTimeLeft * 1000;
    setTimeLeft(newTimeLeft);
    localStorage.setItem("timerEndTime", newEndTime.toString());

    // Send an immediate notification about the newly set timer
    if (Notification.permission === "granted") {
      sendNotification(
        "Timer Started",
        `Your timer is set for ${formatTime(newTimeLeft)}.`,
        "timer-notification"
      );
    }
  };

  const adjustTime = (seconds) => {
    setTimeLeft((prevTime) => {
      const newTimeLeft = Math.max((prevTime || 0) + seconds, 0);
      if (newTimeLeft === 0) {
        localStorage.removeItem("timerEndTime");
      } else {
        const newEndTime = Date.now() + newTimeLeft * 1000;
        localStorage.setItem("timerEndTime", newEndTime.toString());
      }
      return newTimeLeft;
    });
  };

  // Format time function
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toLocaleString(undefined, {
      minimumIntegerDigits: 2,
    })}:${secs.toLocaleString(undefined, { minimumIntegerDigits: 2 })}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 ${themeCss[theme]}`}
      onClick={onClose}
    >
      <div
        className={`p-4 rounded shadow-lg max-w-sm w-full h-2/3 flex flex-col justify-between ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className={`text-xl font-semibold mb-4 text-center ${
            theme === "light" ? "text-gray-900" : "text-white"
          }`}
        >
          Select Timer
        </h2>

        <div
          className={`timer-display text-center text-4xl mb-4 ${
            theme === "light" ? "text-gray-900" : "text-white"
          }`}
        >
          {formatTime(timeLeft)}
        </div>

        <div className="flex flex-col justify-end space-y-4">
          <div className="timer-options flex justify-around mb-4">
            {timeLeft === 0 || timeLeft === null
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