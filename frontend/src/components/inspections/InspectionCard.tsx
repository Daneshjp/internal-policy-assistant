import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Inspection } from '@/types/inspection';
import { format, isPast } from 'date-fns';

interface InspectionCardProps {
  inspection: Inspection & {
    asset?: { asset_name: string; asset_number: string };
    primary_inspector?: { full_name: string };
    findings_count?: number;
  };
  onStart?: (id: number) => void;
  onComplete?: (id: number) => void;
}

export function InspectionCard({ inspection, onStart, onComplete }: InspectionCardProps) {
  const navigate = useNavigate();

  const getStatusVariant = (status: string, date: string): 'success' | 'warning' | 'info' | 'destructive' | 'secondary' => {
    if (status === 'completed') return 'success';
    if (status === 'in_progress') return 'info';
    if (status === 'on_hold') return 'warning';
    if (status === 'cancelled') return 'destructive';
    if (isPast(new Date(date)) && status === 'not_started') return 'destructive';
    return 'secondary';
  };

  const getStatusLabel = (status: string, date: string): string => {
    if (status === 'not_started' && isPast(new Date(date))) return 'OVERDUE';
    return status.toUpperCase().replace('_', ' ');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleCardClick = () => {
    navigate(`/inspections/${inspection.id}`);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
      data-tour="inspection-card"
    >
      <Card
        className="cursor-pointer hover:shadow-lg transition-all h-full flex flex-col"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">
                {inspection.asset?.asset_name || 'Unknown Asset'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {inspection.asset?.asset_number}
              </p>
            </div>
            <Badge
              variant={getStatusVariant(inspection.status, inspection.inspection_date)}
              className="flex items-center gap-1"
            >
              {getStatusIcon(inspection.status)}
              {getStatusLabel(inspection.status, inspection.inspection_date)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Inspection Type */}
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{formatType(inspection.inspection_type)}</span>
            </div>

            {/* Scheduled Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Scheduled:</span>
              <span className="font-medium">
                {format(new Date(inspection.inspection_date), 'MMM dd, yyyy')}
              </span>
            </div>

            {/* Inspector */}
            {inspection.primary_inspector && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Inspector:</span>
                <span className="font-medium">
                  {inspection.primary_inspector.full_name}
                </span>
              </div>
            )}

            {/* Findings Count */}
            {inspection.findings_count !== undefined && inspection.findings_count > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Findings:</span>
                <Badge variant="warning" className="text-xs">
                  {inspection.findings_count}
                </Badge>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {inspection.status === 'not_started' && onStart && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => handleActionClick(e, () => onStart(inspection.id))}
                  className="flex-1"
                  data-tour="start-inspection-btn"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Start
                </Button>
              )}
              {inspection.status === 'in_progress' && onComplete && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => handleActionClick(e, () => onComplete(inspection.id))}
                  className="flex-1"
                  data-tour="complete-inspection-btn"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleCardClick}
                className="flex-1"
                data-tour="view-inspection-btn"
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
