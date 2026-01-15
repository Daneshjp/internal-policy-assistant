import { FC } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { AnnualPlan } from '@/types/planning';

interface PlanCardProps {
  plan: AnnualPlan;
  onClick: (id: number) => void;
}

export const PlanCard: FC<PlanCardProps> = ({ plan, onClick }) => {
  const getStatusVariant = (status: AnnualPlan['status']) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'default';
      case 'pending_approval':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: AnnualPlan['status']) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  const completionRate = plan.status === 'completed' ? 100 :
    (plan.status === 'active' || plan.status === 'in_progress') ? 45 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col"
        onClick={() => onClick(plan.id)}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-bold">
              {plan.year} Annual Plan
            </CardTitle>
            <Badge variant={getStatusVariant(plan.status)}>
              {getStatusLabel(plan.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
          <p className="text-sm text-gray-600 line-clamp-2">
            {plan.description}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Total Inspections</p>
                <p className="font-semibold">{plan.total_inspections || plan.target_inspections || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Year Period</p>
                <p className="font-semibold">
                  {plan.year}
                </p>
              </div>
            </div>
          </div>

          {(plan.status === 'active' || plan.status === 'in_progress') && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Progress</span>
                <span className="text-xs font-semibold">{completionRate}%</span>
              </div>
              <Progress value={completionRate} />
            </div>
          )}

          {plan.approved_at && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                Approved on {new Date(plan.approved_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
