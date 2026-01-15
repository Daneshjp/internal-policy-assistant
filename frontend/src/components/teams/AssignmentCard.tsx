import { FC } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TeamAssignment } from '@/types/team';

interface AssignmentCardProps {
  assignment: TeamAssignment;
  isDragging?: boolean;
}

export const AssignmentCard: FC<AssignmentCardProps> = ({
  assignment,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: assignment.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: TeamAssignment['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'in_progress':
        return 'border-blue-500 bg-blue-50';
      case 'accepted':
        return 'border-yellow-500 bg-yellow-50';
      case 'assigned':
        return 'border-orange-500 bg-orange-50';
      case 'rejected':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className={`mb-2 ${getStatusColor(assignment.status)} border-2`}>
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-sm">
                  {assignment.team_name || `Team ${assignment.team_id}`}
                </h4>
                <Badge variant="outline" className="text-xs">
                  #{assignment.planned_inspection_id}
                </Badge>
              </div>

              {assignment.inspection_details && (
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{assignment.inspection_details.asset_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(
                        assignment.inspection_details.planned_date
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs">
                    <Badge variant="secondary" className="text-xs">
                      {assignment.inspection_details.inspection_type}
                    </Badge>
                  </div>
                </div>
              )}

              {assignment.notes && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  {assignment.notes}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
