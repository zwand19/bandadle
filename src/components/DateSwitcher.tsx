import React from 'react';

interface DateSwitcherProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  availableDates: string[];
}

const DateSwitcher: React.FC<DateSwitcherProps> = ({ 
  currentDate, 
  onDateChange,
  availableDates
}) => {
  return (
    <div style={{ 
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem'
    }}>
      {availableDates.map(date => (
        <button
          key={date}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: date === currentDate ? 'rgb(31, 70, 57)' : 'rgb(242, 236, 215)',
            color: date === currentDate ? 'white' : 'rgb(31, 70, 57)',
            border: '1px solid rgb(31, 70, 57)',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            fontWeight: date === currentDate ? 'bold' : 'normal'
          }}
          onClick={() => onDateChange(date)}
        >
          {date}
        </button>
      ))}
    </div>
  );
};

export default DateSwitcher; 