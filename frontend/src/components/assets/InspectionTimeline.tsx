import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Inspection } from '@/types/inspection';

interface InspectionTimelineProps {
  inspections: Inspection[];
}

export function InspectionTimeline({ inspections }: InspectionTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'on_hold':
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, 'success' | 'info' | 'warning' | 'destructive' | 'secondary'> = {
      completed: 'success',
      in_progress: 'info',
      on_hold: 'warning',
      cancelled: 'destructive',
      not_started: 'secondary',
    };
    return variants[status] || 'secondary';
  };

  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (inspections.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No inspection history available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      {/* Timeline Items */}
      <div className="space-y-6">
        {inspections.map((inspection, index) => (
          <motion.div
            key={inspection.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-14"
          >
            {/* Icon */}
            <div className="absolute left-3.5 top-0 bg-white rounded-full p-1">
              {getStatusIcon(inspection.status)}
            </div>

            {/* Content */}
            <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {formatType(inspection.inspection_type)} Inspection
                  </h4>
                  <p className="text-sm text-gray-500">
                    {new Date(inspection.inspection_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(inspection.status)}>
                  {formatType(inspection.status)}
                </Badge>
              </div>

              {inspection.duration_hours && (
                <p className="text-sm text-gray-600">
                  Duration: {inspection.duration_hours} hours
                </p>
              )}

              {inspection.start_time && inspection.end_time && (
                <p className="text-sm text-gray-600">
                  {new Date(inspection.start_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(inspection.end_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
