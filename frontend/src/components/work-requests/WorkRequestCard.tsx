import { motion } from 'framer-motion';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  User,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WorkRequest } from '@/types/work-request';
import { format } from 'date-fns';

interface WorkRequestCardProps {
  workRequest: WorkRequest;
  onClick?: (wr: WorkRequest) => void;
}

const priorityConfig = {
  low: { color: 'bg-blue-100 text-blue-800', icon: Clock },
  medium: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  high: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  critical: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
};

const statusConfig = {
  draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
  submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock },
  approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
  in_progress: { color: 'bg-purple-100 text-purple-800', icon: Clock },
  completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

const typeConfig = {
  corrective: 'Corrective',
  preventive: 'Preventive',
  replacement: 'Replacement',
  investigation: 'Investigation',
  other: 'Other',
};

export function WorkRequestCard({ workRequest, onClick }: WorkRequestCardProps) {
  const priorityStyle = priorityConfig[workRequest.priority];
  const statusStyle = statusConfig[workRequest.status];
  const StatusIcon = statusStyle.icon;
  const PriorityIcon = priorityStyle.icon;

  const handleClick = () => {
    if (onClick) {
      onClick(workRequest);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col"
        onClick={handleClick}
        data-tour="work-request-card"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-mono text-muted-foreground">
                  {workRequest.wr_number}
                </span>
                <Badge variant="outline" className="text-xs">
                  {typeConfig[workRequest.wr_type]}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                {workRequest.title}
              </h3>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3 space-y-3 flex-1">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {workRequest.description}
          </p>

          {/* Asset Info */}
          {workRequest.asset && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{workRequest.asset.name}</span>
              <span className="text-xs text-muted-foreground">
                ({workRequest.asset.asset_code})
              </span>
            </div>
          )}

          {/* Creator */}
          {workRequest.created_by && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {workRequest.created_by.full_name || workRequest.created_by.email}
              </span>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {format(new Date(workRequest.created_at), 'MMM dd, yyyy')}
            </span>
          </div>

          {/* Estimated Cost */}
          {workRequest.estimated_cost && (
            <div className="text-sm">
              <span className="text-muted-foreground">Est. Cost: </span>
              <span className="font-semibold">
                ${workRequest.estimated_cost.toLocaleString()}
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full">
            {/* Status Badge */}
            <Badge className={statusStyle.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {workRequest.status.replace('_', ' ').toUpperCase()}
            </Badge>

            {/* Priority Badge */}
            <Badge className={priorityStyle.color}>
              <PriorityIcon className="h-3 w-3 mr-1" />
              {workRequest.priority.toUpperCase()}
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
