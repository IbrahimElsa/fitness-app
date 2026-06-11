import React, { useEffect, useRef, useCallback } from "react";
import { useTheme } from "../components/ThemeContext";

// Format time function
const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toLocaleString(undefined, {
    minimumIntegerDigits: 2,
  })}:${secs.toLocaleString(undefined, { minimumIntegerDigits: 2 })}`;
};

const TimerModal = ({ isOpen, onClose, timeLeft, setTimeLeft }) => {
  const { theme, themeCss } = useTheme();
  const intervalRef = useRef(null);

  // We'll keep track of the last "full minute" we used for sending
  // a time-update notification so we don't spam notifications every second.
  const lastMinuteRef = useRef(null);

  // Previous timeLeft value, so the notification effect below only reacts
  // to real 1-second countdown ticks (not user adjustments or re-syncs).
  const prevTimeLeftRef = useRef(timeLeft);

  // Clean up function to properly reset all timer resources
  const cleanupTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    localStorage.removeItem("timerEndTime");
  }, []);

  // Notifications must never crash the app: window.Notification doesn't exist
  // on iOS Safari, and new Notification() throws on Android Chrome even when
  // permission is granted (mobile requires a service worker to show them).
  const sendNotification = useCallback((title, body, tag) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }
    try {
      new Notification(title, {
        body,
        tag,        // Provide a tag so the OS/browser can group or replace
        renotify: true, // Allows the notification to update rather than stack
      });
    } catch (error) {
      console.warn("Unable to show notification:", error);
    }
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
      if ("Notification" in window && Notification.permission === "default") {
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

  // Re-sync the countdown from the saved end time when the user returns to
  // the app. beforeunload doesn't fire on mobile when switching apps, and
  // intervals are throttled in the background, so timeLeft can be stale.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadTimerState();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadTimerState]);

  // Timer interval setup and management
  useEffect(() => {
    // If timer is already running, clear it before setting up a new one
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        // Keep the updater pure; notifications and cleanup happen in the
        // tick effect below so an error here can't unmount the whole app.
        setTimeLeft((prevTimeLeft) => Math.max((prevTimeLeft || 0) - 1, 0));
      }, 1000);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timeLeft, setTimeLeft]);

  // React to countdown ticks: finish the timer and send progress notifications
  useEffect(() => {
    const prevTimeLeft = prevTimeLeftRef.current;
    prevTimeLeftRef.current = timeLeft;

    // Only act on a normal 1-second tick, matching the old interval behavior
    if (prevTimeLeft === null || timeLeft === null || prevTimeLeft - timeLeft !== 1) {
      return;
    }

    if (timeLeft === 0) {
      cleanupTimer();
      // Timer is done
      sendNotification("Timer Complete", "Your timer has finished!", "timer-notification");
      return;
    }

    // Send time-update notifications at appropriate intervals
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    if (seconds === 0 || timeLeft < 60) {
      // Only send once per new "minutes" value,
      // or if we have < 60 seconds left, we can send every 15 seconds to avoid spam
      if ((timeLeft < 60 && seconds % 15 === 0) || lastMinuteRef.current !== minutes) {
        lastMinuteRef.current = minutes;
        sendNotification(
          "Time Update",
          `${formatTime(timeLeft)} remaining`,
          "timer-notification"
        );
      }
    }
  }, [timeLeft, cleanupTimer, sendNotification]);

  const handleTimeSelection = (minutes) => {
    const newTimeLeft = minutes * 60;
    const newEndTime = Date.now() + newTimeLeft * 1000;
    setTimeLeft(newTimeLeft);
    localStorage.setItem("timerEndTime", newEndTime.toString());

    // Send an immediate notification about the newly set timer
    sendNotification(
      "Timer Started",
      `Your timer is set for ${formatTime(newTimeLeft)}.`,
      "timer-notification"
    );
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