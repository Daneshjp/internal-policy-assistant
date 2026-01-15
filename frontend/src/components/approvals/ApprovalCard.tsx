import { FC } from 'react';
import { motion } from 'framer-motion';
import { FileText, User, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import type { ApprovalWorkflow, ApprovalStage } from '@/types';

interface ApprovalCardProps {
  workflow: ApprovalWorkflow;
  reportNumber?: string;
  submittedBy?: string;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onView?: (id: number) => void;
}

const STAGE_LABELS: Record<ApprovalStage, string> = {
  inspector: 'Inspector Review',
  engineer: 'Engineer Review',
  rbi: 'RBI Audit',
  team_leader: 'Team Leader Approval',
};

const STAGE_COLORS: Record<ApprovalStage, string> = {
  inspector: 'bg-blue-100 text-blue-800',
  engineer: 'bg-purple-100 text-purple-800',
  rbi: 'bg-yellow-100 text-yellow-800',
  team_leader: 'bg-green-100 text-green-800',
};

export const ApprovalCard: FC<ApprovalCardProps> = ({
  workflow,
  reportNumber = `RPT-${workflow.report_id}`,
  submittedBy = 'Inspector',
  onApprove,
  onReject,
  onView,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                {reportNumber}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{submittedBy}</span>
              </div>
            </div>
            <Badge className={STAGE_COLORS[workflow.current_stage]}>
              {STAGE_LABELS[workflow.current_stage]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Submitted {formatDistanceToNow(new Date(workflow.created_at), { addSuffix: true })}</span>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onView && onView(workflow.id)}
              >
                View Details
              </Button>

              {onApprove && (
                <Button
                  size="sm"
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(workflow.id);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              )}

              {onReject && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(workflow.id);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
