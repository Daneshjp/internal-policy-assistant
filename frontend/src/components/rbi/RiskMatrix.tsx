import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { RiskMatrixData } from '@/types/rbi';

interface RiskMatrixProps {
  data: RiskMatrixData[];
  onCellClick?: (consequence: number, probability: number) => void;
}

const getRiskLevel = (consequence: number, probability: number): string => {
  const score = consequence * probability;
  if (score >= 20) return 'critical';
  if (score >= 12) return 'high';
  if (score >= 6) return 'medium';
  return 'low';
};

const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'critical':
      return 'bg-red-800 hover:bg-red-700';
    case 'high':
      return 'bg-red-500 hover:bg-red-400';
    case 'medium':
      return 'bg-yellow-500 hover:bg-yellow-400';
    case 'low':
      return 'bg-green-500 hover:bg-green-400';
    default:
      return 'bg-gray-300 hover:bg-gray-200';
  }
};

const getTextColor = (riskLevel: string): string => {
  return riskLevel === 'low' || riskLevel === 'medium' ? 'text-gray-900' : 'text-white';
};

export function RiskMatrix({ data, onCellClick }: RiskMatrixProps) {
  // Create a 5x5 matrix
  const matrix: { [key: string]: RiskMatrixData } = {};

  data.forEach((item) => {
    const key = `${item.consequence}-${item.probability}`;
    matrix[key] = item;
  });

  const consequenceLabels = [
    { level: 5, label: 'Catastrophic' },
    { level: 4, label: 'Major' },
    { level: 3, label: 'Moderate' },
    { level: 2, label: 'Minor' },
    { level: 1, label: 'Negligible' },
  ];

  const probabilityLabels = [
    { level: 1, label: 'Rare' },
    { level: 2, label: 'Unlikely' },
    { level: 3, label: 'Possible' },
    { level: 4, label: 'Likely' },
    { level: 5, label: 'Almost Certain' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Risk Matrix</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-800"></div>
            <span>Critical</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Probability Label (Top) */}
          <div className="flex items-center mb-2">
            <div className="w-24"></div>
            <div className="flex-1 text-center">
              <p className="text-sm font-semibold text-gray-700">Probability</p>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="flex">
            {/* Consequence Labels (Left) */}
            <div className="flex flex-col justify-center mr-2">
              <div className="flex items-center justify-center h-8 mb-2">
                <p className="text-sm font-semibold text-gray-700 -rotate-90 whitespace-nowrap origin-center">
                  Consequence
                </p>
              </div>
              {consequenceLabels.map((label) => (
                <div
                  key={label.level}
                  className="h-16 flex items-center justify-end pr-2"
                >
                  <span className="text-xs font-medium text-gray-600 text-right w-20">
                    {label.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Matrix Cells */}
            <div className="flex-1">
              {/* Column Headers */}
              <div className="flex mb-2 h-8">
                {probabilityLabels.map((label) => (
                  <div
                    key={label.level}
                    className="flex-1 flex items-center justify-center"
                  >
                    <span className="text-xs font-medium text-gray-600">
                      {label.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Rows */}
              {consequenceLabels.map((consLabel) => (
                <div key={consLabel.level} className="flex gap-1 mb-1">
                  {probabilityLabels.map((probLabel) => {
                    const key = `${consLabel.level}-${probLabel.level}`;
                    const cellData = matrix[key];
                    const riskLevel = getRiskLevel(consLabel.level, probLabel.level);
                    const count = cellData?.count || 0;

                    return (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onCellClick?.(consLabel.level, probLabel.level)}
                        className={cn(
                          'flex-1 h-16 rounded-lg border-2 border-white shadow-sm transition-all',
                          'flex flex-col items-center justify-center',
                          getRiskColor(riskLevel),
                          getTextColor(riskLevel),
                          count > 0 ? 'cursor-pointer' : 'cursor-default opacity-80'
                        )}
                        data-tour={
                          consLabel.level === 5 && probLabel.level === 5
                            ? 'rbi-risk-matrix-cell'
                            : undefined
                        }
                      >
                        <span className="text-lg font-bold">{count}</span>
                        <span className="text-xs opacity-90">
                          {count === 1 ? 'asset' : 'assets'}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
