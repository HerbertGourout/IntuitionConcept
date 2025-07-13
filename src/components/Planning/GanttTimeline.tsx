import React from 'react';

interface GanttTimelineProps {
  columns: Date[];
  columnWidth: number;
  viewMode: 'days' | 'weeks' | 'months';
}

const GanttTimeline: React.FC<GanttTimelineProps> = ({ columns, columnWidth, viewMode }) => {
  const formatDate = (date: Date) => {
    switch (viewMode) {
      case 'days':
        return {
          primary: date.getDate().toString(),
          secondary: date.toLocaleDateString('fr-FR', { month: 'short' })
        };
      case 'weeks': {
        const weekStart = new Date(date);
        const weekEnd = new Date(date);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return {
          primary: `S${getWeekNumber(date)}`,
          secondary: `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`
        };
      }
      case 'months':
        return {
          primary: date.toLocaleDateString('fr-FR', { month: 'short' }),
          secondary: date.getFullYear().toString()
        };
      default:
        return { primary: '', secondary: '' };
    }
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  return (
    <div className="flex h-16 bg-gray-50">
      {columns.map((date, index) => {
        const { primary, secondary } = formatDate(date);
        const isCurrentPeriod = isToday(date);
        const isWeekendDay = viewMode === 'days' && isWeekend(date);
        
        return (
          <div
            key={index}
            className={`flex-shrink-0 border-r border-gray-200 flex flex-col justify-center items-center text-center ${
              isCurrentPeriod ? 'bg-orange-100 border-orange-300' : ''
            } ${isWeekendDay ? 'bg-gray-100' : ''}`}
            style={{ width: columnWidth }}
          >
            <div className={`text-sm font-medium ${
              isCurrentPeriod ? 'text-orange-700' : 'text-gray-900'
            }`}>
              {primary}
            </div>
            <div className={`text-xs ${
              isCurrentPeriod ? 'text-orange-600' : 'text-gray-500'
            }`}>
              {secondary}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GanttTimeline;