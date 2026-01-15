import { motion } from 'framer-motion';
import { AlertCircle, Calendar, MapPin, Image as ImageIcon, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { InspectionFinding } from '@/types/inspection';
import { format } from 'date-fns';

interface FindingsListProps {
  findings: InspectionFinding[];
}

export function FindingsList({ findings }: FindingsListProps) {
  const getSeverityVariant = (severity: string): 'destructive' | 'warning' | 'info' | 'secondary' => {
    const variants: Record<string, 'destructive' | 'warning' | 'info' | 'secondary'> = {
      critical: 'destructive',
      high: 'warning',
      medium: 'info',
      low: 'secondary',
    };
    return variants[severity] || 'secondary';
  };

  const getTypeVariant = (type: string): 'destructive' | 'warning' | 'success' | 'secondary' => {
    const variants: Record<string, 'destructive' | 'warning' | 'success' | 'secondary'> = {
      defect: 'destructive',
      observation: 'warning',
      recommendation: 'info' as 'warning',
      ok: 'success',
    };
    return variants[type] || 'secondary';
  };

  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (findings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No findings recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((finding, index) => (
        <motion.div
          key={finding.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Finding #{index + 1}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant={getTypeVariant(finding.finding_type)}>
                    {formatType(finding.finding_type)}
                  </Badge>
                  <Badge variant={getSeverityVariant(finding.severity)}>
                    {finding.severity.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{finding.description}</p>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{finding.location_on_asset}</span>
              </div>

              {/* Photos */}
              {finding.photos && finding.photos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Photos ({finding.photos.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {finding.photos.map((photo, photoIndex) => (
                      <a
                        key={photoIndex}
                        href={photo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-square"
                      >
                        <img
                          src={photo}
                          alt={`Finding photo ${photoIndex + 1}`}
                          className="w-full h-full object-cover rounded border hover:border-primary transition-colors"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Corrective Action */}
              {finding.corrective_action_required && (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-orange-500" />
                    <h4 className="text-sm font-semibold">Corrective Action Required</h4>
                  </div>
                  {finding.corrective_action_description && (
                    <p className="text-sm text-muted-foreground pl-6">
                      {finding.corrective_action_description}
                    </p>
                  )}
                  {finding.corrective_action_deadline && (
                    <div className="flex items-center gap-2 text-sm pl-6">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className="font-medium">
                        {format(new Date(finding.corrective_action_deadline), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Recorded on {format(new Date(finding.created_at), 'MMM dd, yyyy HH:mm')}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
