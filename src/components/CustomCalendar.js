import React from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './CustomCalendar.css';
import { useTheme } from "../components/ThemeContext";
import { useNavigate } from "react-router-dom";

const CustomCalendar = ({ gymVisits }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();

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

  const handleDayClick = (date) => {
    // Format the date as 'YYYY-MM-DD'
    const formattedDate = date.toISOString().split('T')[0];
    // Navigate to the history page with the selected date
    navigate(`/history?date=${formattedDate}`);
  };

  return (
    <div className={`w-full flex justify-center ${theme === 'light' ? 'light-theme' : 'dark-theme'}`}>
      <div className="w-full max-w-[100vw] px-4">
        <Calendar
          tileClassName={tileClassName}
          className="shadow-lg rounded-lg border-none w-full max-w-md mx-auto"
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
          onClickDay={handleDayClick}
        />
      </div>
    </div>
  );
};

export default CustomCalendar;
