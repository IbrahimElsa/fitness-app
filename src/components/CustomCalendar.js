import React from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './CustomCalendar.css';
import { useTheme } from "../components/ThemeContext";

const CustomCalendar = ({ gymVisits }) => {
  const { theme } = useTheme();

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const isToday = new Date().toDateString() === date.toDateString();
      const isGymVisit = gymVisits.some(visit => visit.toDateString() === date.toDateString());
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterdayGymVisit = gymVisits.some(visit => visit.toDateString() === yesterday.toDateString());

      if (isToday && isGymVisit) {
        return 'react-calendar__tile--gym-today';
      } else if (isYesterdayGymVisit && yesterday.toDateString() === date.toDateString()) {
        return 'react-calendar__tile--gym-visit';
      } else if (isGymVisit) {
        return 'react-calendar__tile--gym-visit';
      } else if (isToday) {
        return 'react-calendar__tile--now';
      }
    }
    return null;
  };

  return (
    <div className={`w-full flex justify-center p-4 ${theme === 'light' ? 'light-theme' : 'dark-theme'}`}>
      <div className="w-full max-w-md">
        <Calendar
          tileClassName={tileClassName}
          className="shadow-lg rounded-lg border-none"
          formatShortWeekday={(locale, date) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]}
          next2Label={null}
          prev2Label={null}
          minDetail="month"
          maxDetail="month"
          calendarType="gregory"
          navigationLabel={({ date }) => 
            <span className="react-calendar__navigation__label text-lg font-semibold">
              {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          }
        />
      </div>
    </div>
  );
};

export default CustomCalendar;
