import { motion } from 'framer-motion';
import { Clock, User, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Escalation } from '@/types/escalation';
import type { Severity } from '@/types/inspection';

interface EscalationCardProps {
  escalation: Escalation;
  onClick: () => void;
  getLevelColor: (level: 1 | 2 | 3) => string;
  getSeverityColor: (severity: Severity) => string;
}

export function EscalationCard({
  escalation,
  onClick,
  getLevelColor,
  getSeverityColor,
}: EscalationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'escalated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="cursor-pointer"
      data-tour="escalation-card"
    >
      <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4"
        style={{
          borderLeftColor:
            escalation.escalation_level === 3 ? '#dc2626' :
            escalation.escalation_level === 2 ? '#f97316' :
            '#eab308'
        }}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                {escalation.asset_name}
              </h3>
              <p className="text-sm text-gray-600">
                {escalation.inspection_type.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getLevelColor(escalation.escalation_level)}`}>
              L{escalation.escalation_level}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={getSeverityColor(escalation.severity)}>
              {escalation.severity.toUpperCase()}
            </Badge>
            <Badge className={getStatusColor(escalation.status)}>
              {escalation.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {/* Overdue Days */}
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700">
                <span className="font-semibold text-red-600">
                  {escalation.actual_overdue_days} days
                </span>{' '}
                overdue
              </span>
            </div>

            {/* Scheduled Date */}
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <span className="text-gray-600">
                Scheduled: {formatDate(escalation.scheduled_date)}
              </span>
            </div>

            {/* Assigned To */}
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <span className="text-gray-600">
                Assigned to: {escalation.assigned_to_name}
              </span>
            </div>
          </div>

          {/* Critical Warning */}
          {escalation.severity === 'critical' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-red-600 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Critical Finding - Immediate Action Required
              </div>
            </div>
          )}

          {/* Notes Preview */}
          {escalation.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 line-clamp-2">{escalation.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
