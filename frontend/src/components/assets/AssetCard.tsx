import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Asset } from '@/types/asset';

interface AssetCardProps {
  asset: Asset;
}

export function AssetCard({ asset }: AssetCardProps) {
  const navigate = useNavigate();

  const getCriticalityColor = (criticality: string) => {
    const colors: Record<string, 'destructive' | 'warning' | 'info' | 'secondary'> = {
      critical: 'destructive',
      high: 'warning',
      medium: 'info',
      low: 'secondary',
    };
    return colors[criticality] || 'secondary';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
      active: 'success',
      inactive: 'secondary',
      under_maintenance: 'warning',
      decommissioned: 'destructive',
    };
    return colors[status] || 'secondary';
  };

  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="cursor-pointer hover:shadow-lg transition-all h-full flex flex-col"
        onClick={() => navigate(`/assets/${asset.id}`)}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{asset.asset_name}</CardTitle>
            <Badge variant={getCriticalityColor(asset.criticality)}>
              {asset.criticality.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{asset.asset_number}</p>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{formatType(asset.asset_type)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{asset.location}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={getStatusColor(asset.status)} className="text-xs">
                {formatType(asset.status)}
              </Badge>
            </div>
            {asset.last_inspection_date && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Last Inspection:</span>
                <span className="font-medium">
                  {new Date(asset.last_inspection_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
