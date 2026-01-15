import { motion } from 'framer-motion';
import { CheckCircle, Clock, Calendar, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface TimelineEvent {
  status: string;
  timestamp: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
}

interface InspectionStatusTimelineProps {
  inspection: {
    status: string;
    inspection_date: string;
    actual_start_time?: string;
    actual_end_time?: string;
    created_at: string;
  };
}

export function InspectionStatusTimeline({ inspection }: InspectionStatusTimelineProps) {
  const getTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [
      {
        status: 'created',
        timestamp: inspection.created_at,
        icon: <Calendar className="h-4 w-4" />,
        label: 'Inspection Scheduled',
        description: `For ${format(new Date(inspection.inspection_date), 'MMM dd, yyyy')}`,
      },
    ];

    if (inspection.actual_start_time) {
      events.push({
        status: 'started',
        timestamp: inspection.actual_start_time,
        icon: <Clock className="h-4 w-4" />,
        label: 'Inspection Started',
        description: format(new Date(inspection.actual_start_time), 'MMM dd, yyyy HH:mm'),
      });
    }

    if (inspection.actual_end_time) {
      events.push({
        status: 'completed',
        timestamp: inspection.actual_end_time,
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Inspection Completed',
        description: format(new Date(inspection.actual_end_time), 'MMM dd, yyyy HH:mm'),
      });
    }

    if (inspection.status === 'cancelled') {
      events.push({
        status: 'cancelled',
        timestamp: new Date().toISOString(),
        icon: <XCircle className="h-4 w-4" />,
        label: 'Inspection Cancelled',
      });
    }

    return events;
  };

  const events = getTimelineEvents();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'started':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Status Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Events */}
          <div className="space-y-6">
            {events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4"
              >
                {/* Icon Circle */}
                <div
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${getStatusColor(
                    event.status
                  )} text-white`}
                >
                  {event.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <p className="font-medium text-sm">{event.label}</p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
