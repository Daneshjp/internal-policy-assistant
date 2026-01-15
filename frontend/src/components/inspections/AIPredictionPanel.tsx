import { FC } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp, CheckCircle, AlertTriangle, Brain, Cpu } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CircularGauge } from './CircularGauge';
import type { FailurePrediction, ConsequenceLevel, PriorityLevel } from '@/types/inspection';

interface AIPredictionPanelProps {
  prediction: FailurePrediction | null;
  isLoading?: boolean;
}

/**
 * Main visualization panel for AI-powered failure predictions.
 * Displays probability of failure, consequence level, confidence score,
 * risk score, priority, and recommended actions.
 */
export const AIPredictionPanel: FC<AIPredictionPanelProps> = ({
  prediction,
  isLoading = false,
}) => {
  // Helper functions for UI variants
  const getConsequenceColor = (level: ConsequenceLevel): string => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[level] || colors.low;
  };

  const getPriorityIcon = (priority: PriorityLevel) => {
    const icons = {
      low: <CheckCircle className="h-4 w-4" />,
      medium: <TrendingUp className="h-4 w-4" />,
      high: <AlertTriangle className="h-4 w-4" />,
      critical: <AlertCircle className="h-4 w-4" />,
    };
    return icons[priority] || icons.low;
  };

  const getPriorityColor = (priority: PriorityLevel): 'default' | 'secondary' | 'destructive' => {
    const variants = {
      low: 'secondary' as const,
      medium: 'default' as const,
      high: 'default' as const,
      critical: 'destructive' as const,
    };
    return variants[priority] || 'default';
  };

  const getRiskScoreColor = (score: number): string => {
    if (score >= 240) return 'bg-red-500'; // Critical (PoF * 4)
    if (score >= 180) return 'bg-orange-500'; // High (PoF * 3)
    if (score >= 120) return 'bg-yellow-500'; // Medium (PoF * 2)
    return 'bg-green-500'; // Low (PoF * 1)
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            AI Failure Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <p className="text-sm text-gray-600">Analyzing sensor data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!prediction) {
    return (
      <Card className="w-full border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-500">
            <TrendingUp className="h-5 w-5" />
            AI Failure Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">No prediction available</p>
            <p className="text-xs text-gray-500">
              Enter sensor data above to generate real-time failure predictions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main prediction display
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              AI Failure Prediction
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Brain className="h-3 w-3" />
                <span>Risk-Based Model</span>
              </Badge>
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                <span>{prediction.model_version}</span>
              </Badge>
            </div>
          </CardTitle>
          <p className="text-xs text-gray-500 mt-2">
            Predictions powered by threshold-based risk assessment algorithm analyzing 6 key sensor parameters
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gauges Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Probability of Failure */}
            <div className="flex flex-col items-center">
              <CircularGauge
                value={Number(prediction.probability_of_failure)}
                label="Probability of Failure"
              />
            </div>

            {/* Consequence of Failure */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-center space-y-3">
                <div className="text-sm font-medium text-gray-600">Consequence of Failure</div>
                <Badge
                  className={`${getConsequenceColor(prediction.consequence_of_failure)} px-4 py-2 text-base font-semibold uppercase`}
                >
                  {prediction.consequence_of_failure}
                </Badge>
              </div>
            </div>

            {/* Confidence Score */}
            <div className="flex flex-col items-center">
              <CircularGauge
                value={Number(prediction.confidence_score)}
                label="Confidence Score"
                customColors={{
                  low: '#ef4444',
                  medium: '#f97316',
                  high: '#eab308',
                  critical: '#22c55e',
                }}
              />
            </div>
          </div>

          {/* Risk Score Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Risk Score</span>
              <span className="text-sm font-bold text-gray-900">
                {Number(prediction.risk_score).toFixed(2)} / 400
              </span>
            </div>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getRiskScoreColor(Number(prediction.risk_score))} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${(Number(prediction.risk_score) / 400) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Priority Badge */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Priority Level</span>
            <Badge variant={getPriorityColor(prediction.priority)} className="text-sm px-3 py-1">
              <span className="flex items-center gap-1">
                {getPriorityIcon(prediction.priority)}
                <span className="uppercase">{prediction.priority}</span>
              </span>
            </Badge>
          </div>

          {/* Recommended Actions */}
          {prediction.recommended_action && (
            <motion.div
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Recommended Action
                  </h4>
                  <p className="text-sm text-blue-800">{prediction.recommended_action}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-gray-500 text-center">
            Prediction generated at{' '}
            {new Date(prediction.prediction_timestamp).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
