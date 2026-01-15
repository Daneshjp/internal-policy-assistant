import { useState } from 'react';
import {
  Building2,
  User,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Send,
  ThumbsUp,
  ThumbsDown,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WorkRequest } from '@/types/work-request';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface WorkRequestDetailDialogProps {
  open: boolean;
  onClose: () => void;
  workRequest: WorkRequest | null;
  onEdit?: () => void;
  onSubmit?: (id: number) => Promise<void>;
  onApprove?: (id: number) => Promise<void>;
  onReject?: (id: number) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

const statusConfig = {
  draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
  submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock },
  approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
  in_progress: { color: 'bg-purple-100 text-purple-800', icon: Clock },
  completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

const priorityConfig = {
  low: { color: 'bg-blue-100 text-blue-800', icon: Clock },
  medium: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  high: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  critical: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
};

export function WorkRequestDetailDialog({
  open,
  onClose,
  workRequest,
  onEdit,
  onSubmit,
  onApprove,
  onReject,
  onDelete,
}: WorkRequestDetailDialogProps) {
  const { user } = useAuth();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!workRequest) {
    return null;
  }

  const statusStyle = statusConfig[workRequest.status];
  const priorityStyle = priorityConfig[workRequest.priority];
  const StatusIcon = statusStyle.icon;
  const PriorityIcon = priorityStyle.icon;

  const canEdit = user?.role === 'engineer' || user?.role === 'team_leader' || user?.role === 'admin';
  const canApprove = (user?.role === 'team_leader' || user?.role === 'admin') && workRequest.status === 'submitted';
  const canSubmit = workRequest.status === 'draft' && canEdit;
  const canDelete = (user?.role === 'team_leader' || user?.role === 'admin');

  const handleAction = async (action: string, actionFn?: (id: number) => Promise<void>) => {
    if (!actionFn) return;

    setActionLoading(action);
    try {
      await actionFn(workRequest.id);
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{workRequest.title}</DialogTitle>
              <DialogDescription className="mt-2">
                <span className="font-mono text-base">{workRequest.wr_number}</span>
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={statusStyle.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {workRequest.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={priorityStyle.color}>
                <PriorityIcon className="h-3 w-3 mr-1" />
                {workRequest.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {workRequest.description}
                </p>
              </CardContent>
            </Card>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {workRequest.wr_type}
                  </p>
                </div>
              </div>

              {/* Asset */}
              {workRequest.asset && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Asset</p>
                    <p className="text-sm text-muted-foreground">
                      {workRequest.asset.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {workRequest.asset.asset_code}
                    </p>
                  </div>
                </div>
              )}

              {/* Created By */}
              {workRequest.created_by && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Created By</p>
                    <p className="text-sm text-muted-foreground">
                      {workRequest.created_by.full_name || workRequest.created_by.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(workRequest.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>

              {/* Estimated Cost */}
              {workRequest.estimated_cost && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Estimated Cost</p>
                    <p className="text-sm text-muted-foreground">
                      ${workRequest.estimated_cost.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Approved By */}
              {workRequest.approved_by && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Approved By</p>
                    <p className="text-sm text-muted-foreground">
                      {workRequest.approved_by.full_name || workRequest.approved_by.email}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* SAP Sync Status */}
            {workRequest.sap_sync_status && (
              <Card className={workRequest.sap_sync_status === 'failed' ? 'border-red-200 bg-red-50' : ''}>
                <CardHeader>
                  <CardTitle className="text-base">SAP Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sync Status:</span>
                    <Badge variant={workRequest.sap_sync_status === 'synced' ? 'default' : 'secondary'}>
                      {workRequest.sap_sync_status}
                    </Badge>
                  </div>
                  {workRequest.sap_sync_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last synced: {format(new Date(workRequest.sap_sync_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                  {workRequest.sap_error_message && (
                    <p className="text-xs text-red-600 mt-2">{workRequest.sap_error_message}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Created Event */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Work Request Created</p>
                      <p className="text-xs text-muted-foreground">
                        {workRequest.created_by?.full_name || workRequest.created_by?.email} created this work request
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(workRequest.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  {/* Approval Event */}
                  {workRequest.approved_by && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Work Request Approved</p>
                        <p className="text-xs text-muted-foreground">
                          {workRequest.approved_by.full_name || workRequest.approved_by.email} approved this work request
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Additional timeline events would go here */}
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Detailed activity history will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                {workRequest.documents && workRequest.documents.length > 0 ? (
                  <div className="space-y-2">
                    {workRequest.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.file_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {doc.document_type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No documents attached
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            {canDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('delete', onDelete)}
                disabled={!!actionLoading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {canSubmit && (
              <Button
                size="sm"
                onClick={() => handleAction('submit', onSubmit)}
                disabled={!!actionLoading}
              >
                <Send className="h-4 w-4 mr-1" />
                {actionLoading === 'submit' ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            )}
            {canApprove && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction('reject', onReject)}
                  disabled={!!actionLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  {actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAction('approve', onApprove)}
                  disabled={!!actionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
                </Button>
              </>
            )}
            {canEdit && onEdit && (
              <Button size="sm" onClick={onEdit} disabled={!!actionLoading}>
                Edit
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
