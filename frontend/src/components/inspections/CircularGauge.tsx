import { FC } from 'react';
import { motion } from 'framer-motion';

interface CircularGaugeProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  customColors?: {
    low: string;
    medium: string;
    high: string;
    critical: string;
  };
}

/**
 * Animated circular gauge component for displaying percentage values.
 * Color-codes based on value: green < 40, yellow < 60, orange < 80, red ≥ 80
 */
export const CircularGauge: FC<CircularGaugeProps> = ({
  value,
  size = 120,
  strokeWidth = 12,
  label,
  customColors,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  // Default color coding
  const getColor = (val: number): string => {
    if (customColors) {
      if (val >= 80) return customColors.critical;
      if (val >= 60) return customColors.high;
      if (val >= 40) return customColors.medium;
      return customColors.low;
    }

    // Default colors
    if (val >= 80) return '#ef4444'; // red-500
    if (val >= 60) return '#f97316'; // orange-500
    if (val >= 40) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const color = getColor(value);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Animated progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="text-2xl font-bold"
              style={{ color }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              {value.toFixed(0)}%
            </motion.div>
          </div>
        </div>
      </div>

      {/* Label */}
      {label && (
        <motion.div
          className="mt-2 text-sm font-medium text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {label}
        </motion.div>
      )}
    </div>
  );
};
