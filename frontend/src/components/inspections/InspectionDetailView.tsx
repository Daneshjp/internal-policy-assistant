import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  User,
  FileText,
  MapPin,
  Clock,
  CheckCircle,
  CloudRain,
  Plus,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FindingsList } from './FindingsList';
import { FindingForm } from './FindingForm';
import { AIPredictionPanel } from './AIPredictionPanel';
import { SensorHistoryTable } from './SensorHistoryTable';
import { useInspectionFindings, useAddFinding, useUploadPhotos } from '@/hooks/useInspections';
import { useLatestAIPrediction } from '@/hooks/useAIPrediction';
import type { Inspection, FailurePrediction, AIAssessment } from '@/types/inspection';
import { format, isPast, differenceInMinutes } from 'date-fns';
import { inspectionService } from '@/services/inspectionService';

interface InspectionDetailViewProps {
  inspection: Inspection & {
    asset?: { asset_name: string; asset_number: string; location: string };
    primary_inspector?: { full_name: string; email: string };
  };
  onStart?: (id: number) => void;
  onComplete?: (id: number) => void;
}

export function InspectionDetailView({
  inspection,
  onStart,
  onComplete,
}: InspectionDetailViewProps) {
  const navigate = useNavigate();
  const [isFindingFormOpen, setIsFindingFormOpen] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<FailurePrediction | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null);
  const [sensorHistory, setSensorHistory] = useState<AIAssessment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { data: findings = [], isLoading: findingsLoading } = useInspectionFindings(inspection.id);
  const addFinding = useAddFinding();
  const uploadPhotos = useUploadPhotos();

  // AI Prediction hooks - auto-refresh every 30 seconds for in-progress inspections
  const { data: latestAssessment, refetch: refetchAssessment } = useLatestAIPrediction(
    inspection.id,
    inspection.status === 'in_progress'
  );

  // Set initial prediction from latest assessment
  useEffect(() => {
    if (latestAssessment?.prediction) {
      setCurrentPrediction(latestAssessment.prediction);
    }
  }, [latestAssessment]);

  // Auto-refresh prediction every 30 seconds for in-progress inspections
  useEffect(() => {
    if (inspection.status !== 'in_progress') return;

    const interval = setInterval(() => {
      refetchAssessment();
      loadSensorHistory(); // Also refresh history
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [inspection.status, refetchAssessment]);

  // Load sensor history on mount and when inspection status changes
  useEffect(() => {
    if (inspection.status === 'in_progress' || inspection.status === 'completed') {
      loadSensorHistory();
    }
  }, [inspection.id, inspection.status]);

  // Function to load sensor history
  const loadSensorHistory = async () => {
    setHistoryLoading(true);
    try {
      const history = await inspectionService.getSensorHistory(inspection.id, 20);
      setSensorHistory(history);
    } catch (error) {
      console.error('Failed to load sensor history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getStatusVariant = (status: string, date: string): 'success' | 'warning' | 'info' | 'destructive' | 'secondary' => {
    if (status === 'completed') return 'success';
    if (status === 'in_progress') return 'info';
    if (status === 'on_hold') return 'warning';
    if (status === 'cancelled') return 'destructive';
    if (isPast(new Date(date)) && status === 'not_started') return 'destructive';
    return 'secondary';
  };

  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getDuration = () => {
    if (!inspection.actual_start_time) return null;
    const endTime = inspection.actual_end_time
      ? new Date(inspection.actual_end_time)
      : new Date();
    const startTime = new Date(inspection.actual_start_time);
    const minutes = differenceInMinutes(endTime, startTime);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleAddFinding = async (
    findingData: {
      finding_type: string;
      severity: string;
      description: string;
      location_on_asset: string;
      corrective_action_required: boolean;
      corrective_action_description?: string;
      corrective_action_deadline?: string;
    },
    photos: File[]
  ) => {
    try {
      // Upload photos first if any
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        const uploadResult = await uploadPhotos.mutateAsync({
          inspectionId: inspection.id,
          files: photos,
        });
        photoUrls = uploadResult;
      }

      // Add finding with photo URLs
      await addFinding.mutateAsync({
        inspectionId: inspection.id,
        finding: {
          ...findingData,
          photos: photoUrls,
        } as any,
      });

      setIsFindingFormOpen(false);
    } catch (error) {
      console.error('Failed to add finding:', error);
    }
  };

  // Handle manual sensor polling
  const handleManualPoll = async () => {
    if (inspection.status !== 'in_progress') return;

    setIsPolling(true);
    try {
      const result = await inspectionService.pollSensors(inspection.id);
      setCurrentPrediction(result.prediction);
      setLastPollTime(new Date());
      // Refresh the assessment and history to sync with backend
      await refetchAssessment();
      await loadSensorHistory();
    } catch (error) {
      console.error('Failed to poll sensors:', error);
    } finally {
      setIsPolling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/inspections')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inspections
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {inspection.asset?.asset_name || 'Inspection Details'}
              </h1>
              <p className="text-gray-600">{inspection.asset?.asset_number}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={getStatusVariant(inspection.status, inspection.inspection_date)}
                className="h-fit"
              >
                {inspection.status.toUpperCase().replace('_', ' ')}
              </Badge>
              {inspection.status === 'not_started' && onStart && (
                <Button onClick={() => onStart(inspection.id)} data-tour="start-inspection">
                  <Clock className="h-4 w-4 mr-2" />
                  Start Inspection
                </Button>
              )}
              {inspection.status === 'in_progress' && onComplete && (
                <Button onClick={() => onComplete(inspection.id)} data-tour="complete-inspection">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Inspection
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Overview Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{formatType(inspection.inspection_type)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Scheduled Date</p>
                      <p className="font-medium">
                        {format(new Date(inspection.inspection_date), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  {inspection.actual_start_time && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Started</p>
                        <p className="font-medium">
                          {format(new Date(inspection.actual_start_time), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  )}

                  {inspection.actual_end_time && (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="font-medium">
                          {format(new Date(inspection.actual_end_time), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  )}

                  {getDuration() && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{getDuration()}</p>
                      </div>
                    </div>
                  )}

                  {inspection.asset?.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{inspection.asset.location}</p>
                      </div>
                    </div>
                  )}

                  {inspection.weather_conditions && (
                    <div className="flex items-start gap-3">
                      <CloudRain className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Weather</p>
                        <p className="font-medium">{inspection.weather_conditions}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Inspector Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Inspector</CardTitle>
                </CardHeader>
                <CardContent>
                  {inspection.primary_inspector ? (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {inspection.primary_inspector.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {inspection.primary_inspector.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not assigned</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Notes Card */}
            {inspection.inspection_notes && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {inspection.inspection_notes}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Findings and AI Prediction */}
          <div className="lg:col-span-2 space-y-6">
            {/* Findings Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Findings</CardTitle>
                    {inspection.status === 'in_progress' && (
                      <Button
                        onClick={() => setIsFindingFormOpen(true)}
                        size="sm"
                        data-tour="add-finding"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Finding
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {findingsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    </div>
                  ) : (
                    <FindingsList findings={findings} />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Prediction Section - Only show during in_progress inspections */}
            {inspection.status === 'in_progress' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                {/* Sensor Status Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <RefreshCw className={`h-5 w-5 ${isPolling ? 'animate-spin text-blue-600' : 'text-gray-600'}`} />
                        Automatic Sensor Monitoring
                      </CardTitle>
                      <Button
                        onClick={handleManualPoll}
                        disabled={isPolling}
                        size="sm"
                        variant="outline"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isPolling ? 'animate-spin' : ''}`} />
                        Poll Sensors Now
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Polling Interval:</span>
                        <Badge variant="secondary">Every 15 minutes</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Auto-Refresh Display:</span>
                        <Badge variant="secondary">Every 30 seconds</Badge>
                      </div>
                      {lastPollTime && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Last Manual Poll:</span>
                          <span className="text-gray-900 font-medium">
                            {lastPollTime.toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      <div className="pt-3 border-t">
                        <p className="text-xs text-gray-500">
                          Sensors are automatically polled every 15 minutes. Mock sensor data simulates
                          real-world readings with varying risk levels. Click "Poll Sensors Now" for
                          an immediate reading.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Prediction Panel */}
                <AIPredictionPanel
                  prediction={currentPrediction}
                  isLoading={isPolling}
                />

                {/* Sensor History Table */}
                <SensorHistoryTable
                  history={sensorHistory}
                  isLoading={historyLoading}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Finding Form Dialog */}
      <FindingForm
        isOpen={isFindingFormOpen}
        onClose={() => setIsFindingFormOpen(false)}
        onSubmit={handleAddFinding}
        isLoading={addFinding.isPending || uploadPhotos.isPending}
      />
    </div>
  );
}
