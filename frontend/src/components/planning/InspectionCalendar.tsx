import { FC, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PlannedInspection } from '@/types/planning';

interface InspectionCalendarProps {
  inspections: PlannedInspection[];
  onDateClick?: (date: Date) => void;
  onInspectionClick?: (inspection: PlannedInspection) => void;
}

export const InspectionCalendar: FC<InspectionCalendarProps> = ({
  inspections,
  onDateClick,
  onInspectionClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const getInspectionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return inspections.filter(
      (inspection) => inspection.planned_date.split('T')[0] === dateStr
    );
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="p-2 border border-gray-200" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayInspections = getInspectionsForDate(date);
    const isToday = new Date().toDateString() === date.toDateString();

    days.push(
      <div
        key={day}
        className={`p-2 border border-gray-200 min-h-24 cursor-pointer hover:bg-gray-50 transition-colors ${
          isToday ? 'bg-blue-50' : ''
        }`}
        onClick={() => onDateClick?.(date)}
      >
        <div className="font-semibold text-sm mb-1">{day}</div>
        <div className="space-y-1">
          {dayInspections.slice(0, 3).map((inspection) => (
            <Badge
              key={inspection.id}
              variant={
                inspection.status === 'completed'
                  ? 'success'
                  : inspection.status === 'overdue'
                  ? 'destructive'
                  : 'default'
              }
              className="text-xs cursor-pointer w-full justify-start"
              onClick={(e) => {
                e.stopPropagation();
                onInspectionClick?.(inspection);
              }}
            >
              {inspection.inspection_type}
            </Badge>
          ))}
          {dayInspections.length > 3 && (
            <span className="text-xs text-gray-500">
              +{dayInspections.length - 3} more
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0 border border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-2 text-center font-semibold text-sm bg-gray-100 border-b border-gray-200"
          >
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
};
