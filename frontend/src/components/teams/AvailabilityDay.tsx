import { FC } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityDayProps {
  date: Date;
  isAvailable: boolean;
  reason?: string;
  onClick: (date: Date) => void;
  isSelected?: boolean;
  isToday?: boolean;
}

export const AvailabilityDay: FC<AvailabilityDayProps> = ({
  date,
  isAvailable,
  reason,
  onClick,
  isSelected = false,
  isToday = false,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'relative p-2 rounded-lg cursor-pointer transition-all border-2',
        isAvailable
          ? 'bg-green-50 border-green-200 hover:bg-green-100'
          : 'bg-red-50 border-red-200 hover:bg-red-100',
        isSelected && 'ring-2 ring-blue-500',
        isToday && 'ring-2 ring-purple-500'
      )}
      onClick={() => onClick(date)}
      title={reason || (isAvailable ? 'Available' : 'Unavailable')}
    >
      <div className="flex flex-col items-center">
        <span className="text-xs font-semibold">
          {date.toLocaleDateString('en-US', { weekday: 'short' })}
        </span>
        <span className="text-lg font-bold">{date.getDate()}</span>
        <div className="mt-1">
          {isAvailable ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <X className="w-4 h-4 text-red-600" />
          )}
        </div>
      </div>
      {reason && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </motion.div>
  );
};
