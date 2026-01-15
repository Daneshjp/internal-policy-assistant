import { FC } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AIAssessment, ConsequenceLevel, PriorityLevel } from '@/types/inspection';

interface SensorHistoryTableProps {
  history: AIAssessment[];
  isLoading?: boolean;
}

/**
 * Displays historical sensor readings and predictions in a table format.
 * Shows timestamps, sensor values, and prediction results for transparency.
 */
export const SensorHistoryTable: FC<SensorHistoryTableProps> = ({
  history,
  isLoading = false,
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getPriorityVariant = (priority: PriorityLevel): 'default' | 'secondary' | 'destructive' => {
    if (priority === 'critical') return 'destructive';
    if (priority === 'high') return 'destructive';
    if (priority === 'medium') return 'default';
    return 'secondary';
  };

  const getConsequenceColor = (level: ConsequenceLevel): string => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600',
    };
    return colors[level] || colors.low;
  };

  const getTrendIcon = (pof: number) => {
    if (pof >= 60) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (pof >= 40) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Sensor Reading History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Sensor Reading History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No sensor readings yet. Waiting for first automatic poll...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Sensor Reading History
            </CardTitle>
            <Badge variant="secondary">{history.length} readings</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead className="text-right">Pressure</TableHead>
                  <TableHead className="text-right">Temp</TableHead>
                  <TableHead className="text-right">Thickness</TableHead>
                  <TableHead className="text-right">Corrosion</TableHead>
                  <TableHead className="text-right">Vibration</TableHead>
                  <TableHead className="text-right">Flow</TableHead>
                  <TableHead className="text-center">PoF</TableHead>
                  <TableHead className="text-center">CoF</TableHead>
                  <TableHead className="text-center">Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record, index) => (
                  <motion.tr
                    key={record.sensor_data.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b hover:bg-gray-50"
                  >
                    <TableCell className="font-mono text-xs">
                      {formatTimestamp(record.sensor_data.recorded_at)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {record.sensor_data.pressure ? (
                        <span>{Number(record.sensor_data.pressure).toFixed(1)} <span className="text-gray-500 text-xs">bar</span></span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {record.sensor_data.temperature ? (
                        <span>{Number(record.sensor_data.temperature).toFixed(1)} <span className="text-gray-500 text-xs">°C</span></span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {record.sensor_data.wall_thickness ? (
                        <span>{Number(record.sensor_data.wall_thickness).toFixed(2)} <span className="text-gray-500 text-xs">mm</span></span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {record.sensor_data.corrosion_rate ? (
                        <span>{Number(record.sensor_data.corrosion_rate).toFixed(4)} <span className="text-gray-500 text-xs">mm/y</span></span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {record.sensor_data.vibration ? (
                        <span>{Number(record.sensor_data.vibration).toFixed(2)} <span className="text-gray-500 text-xs">mm/s</span></span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {record.sensor_data.flow_rate ? (
                        <span>{Number(record.sensor_data.flow_rate).toFixed(1)} <span className="text-gray-500 text-xs">m³/h</span></span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(Number(record.prediction.probability_of_failure))}
                        <span className="font-semibold text-sm">
                          {Number(record.prediction.probability_of_failure).toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-semibold text-sm uppercase ${getConsequenceColor(record.prediction.consequence_of_failure)}`}>
                        {record.prediction.consequence_of_failure}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getPriorityVariant(record.prediction.priority)} className="text-xs">
                        {record.prediction.priority}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            Showing latest {history.length} sensor readings with AI predictions
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
