import { FC } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApprovalStage, ApprovalStageRecord } from '@/types';

interface ApprovalStepperProps {
  currentStage: ApprovalStage;
  stages: ApprovalStageRecord[];
}

const STAGE_ORDER: ApprovalStage[] = ['inspector', 'engineer', 'rbi', 'team_leader'];

const STAGE_LABELS: Record<ApprovalStage, string> = {
  inspector: 'Inspector',
  engineer: 'Engineer',
  rbi: 'RBI Auditor',
  team_leader: 'Team Leader',
};

export const ApprovalStepper: FC<ApprovalStepperProps> = ({ currentStage, stages }) => {
  const currentStageIndex = STAGE_ORDER.indexOf(currentStage);

  const getStageStatus = (stage: ApprovalStage): 'completed' | 'current' | 'pending' | 'rejected' => {
    const stageRecord = stages.find(s => s.stage === stage);
    if (!stageRecord) return 'pending';
    if (stageRecord.status === 'approved') return 'completed';
    if (stageRecord.status === 'rejected') return 'rejected';
    return stage === currentStage ? 'current' : 'pending';
  };

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between">
        {STAGE_ORDER.map((stage, index) => {
          const status = getStageStatus(stage);
          const isLast = index === STAGE_ORDER.length - 1;

          return (
            <div key={stage} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                    status === 'completed' && "bg-green-500 border-green-500",
                    status === 'current' && "bg-blue-500 border-blue-500 animate-pulse",
                    status === 'rejected' && "bg-red-500 border-red-500",
                    status === 'pending' && "bg-gray-200 border-gray-300"
                  )}
                >
                  {status === 'completed' && <Check className="w-6 h-6 text-white" />}
                  {status === 'current' && <Clock className="w-6 h-6 text-white" />}
                  {status === 'rejected' && <XCircle className="w-6 h-6 text-white" />}
                  {status === 'pending' && <span className="text-gray-500">{index + 1}</span>}
                </motion.div>
                <span className={cn(
                  "mt-2 text-sm font-medium",
                  status === 'current' && "text-blue-600",
                  status === 'completed' && "text-green-600",
                  status === 'rejected' && "text-red-600",
                  status === 'pending' && "text-gray-500"
                )}>
                  {STAGE_LABELS[stage]}
                </span>
              </div>

              {!isLast && (
                <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: status === 'completed' ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-green-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
