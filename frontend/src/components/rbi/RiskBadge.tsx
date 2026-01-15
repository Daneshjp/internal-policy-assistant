import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import type { RiskLevel } from '@/types/rbi';

interface RiskBadgeProps {
  riskLevel: RiskLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ riskLevel, showIcon = true, size = 'md' }: RiskBadgeProps) {
  const getRiskConfig = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return {
          variant: 'destructive' as const,
          label: 'Critical',
          icon: AlertTriangle,
          className: 'bg-red-800 hover:bg-red-700',
        };
      case 'high':
        return {
          variant: 'destructive' as const,
          label: 'High',
          icon: AlertCircle,
          className: 'bg-red-500 hover:bg-red-400',
        };
      case 'medium':
        return {
          variant: 'warning' as const,
          label: 'Medium',
          icon: Info,
          className: '',
        };
      case 'low':
        return {
          variant: 'success' as const,
          label: 'Low',
          icon: CheckCircle,
          className: '',
        };
      default:
        return {
          variant: 'default' as const,
          label: 'Unknown',
          icon: Info,
          className: '',
        };
    }
  };

  const config = getRiskConfig(riskLevel);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]} font-semibold`}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
