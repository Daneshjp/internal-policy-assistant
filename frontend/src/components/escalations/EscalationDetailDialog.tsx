import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Clock,
  Calendar,
  User,
  TrendingUp,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useReassignEscalation,
  useSendReminder,
  useResolveEscalation,
  useEscalateHigher,
  useAddComment,
  useEscalationComments,
  useEscalationActions,
} from '@/hooks/useEscalations';
import type { Escalation } from '@/types/escalation';
import type { Severity } from '@/types/inspection';

interface EscalationDetailDialogProps {
  escalation: Escalation;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  getLevelColor: (level: 1 | 2 | 3) => string;
  getSeverityColor: (severity: Severity) => string;
}

export function EscalationDetailDialog({
  escalation,
  open,
  onClose,
  onUpdate,
  getLevelColor,
  getSeverityColor,
}: EscalationDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'comments'>('details');
  const [comment, setComment] = useState('');
  const [resolveNote, setResolveNote] = useState('');
  const [escalateReason, setEscalateReason] = useState('');
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [newInspectorId, setNewInspectorId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  // Fetch comments and actions
  const { data: comments, isLoading: commentsLoading } = useEscalationComments(escalation.id);
  const { data: actions, isLoading: actionsLoading } = useEscalationActions(escalation.id);

  // Mutations
  const reassignMutation = useReassignEscalation();
  const sendReminderMutation = useSendReminder();
  const resolveMutation = useResolveEscalation();
  const escalateMutation = useEscalateHigher();
  const addCommentMutation = useAddComment();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      await addCommentMutation.mutateAsync({
        escalationId: escalation.id,
        comment: comment.trim(),
      });
      setComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleSendReminder = async () => {
    try {
      await sendReminderMutation.mutateAsync(escalation.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to send reminder:', error);
    }
  };

  const handleResolve = async () => {
    try {
      await resolveMutation.mutateAsync({
        id: escalation.id,
        note: resolveNote.trim() || undefined,
      });
      setShowResolveDialog(false);
      setResolveNote('');
      onUpdate();
    } catch (error) {
      console.error('Failed to resolve escalation:', error);
    }
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim()) return;

    try {
      await escalateMutation.mutateAsync({
        id: escalation.id,
        reason: escalateReason.trim(),
      });
      setShowEscalateDialog(false);
      setEscalateReason('');
      onUpdate();
    } catch (error) {
      console.error('Failed to escalate:', error);
    }
  };

  const handleReassign = async () => {
    if (!newInspectorId) return;

    try {
      await reassignMutation.mutateAsync({
        id: escalation.id,
        data: {
          new_inspector_id: parseInt(newInspectorId),
          reason: reassignReason.trim() || undefined,
        },
      });
      setShowReassignDialog(false);
      setNewInspectorId('');
      setReassignReason('');
      onUpdate();
    } catch (error) {
      console.error('Failed to reassign:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'escalated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'reassigned':
        return <UserPlus className="h-4 w-4" />;
      case 'reminder_sent':
        return <Send className="h-4 w-4" />;
      case 'escalated':
        return <TrendingUp className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'note_added':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-tour="escalation-detail-dialog">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Escalation Details</DialogTitle>
          <DialogDescription>
            Manage and track escalation for {escalation.asset_name}
          </DialogDescription>
        </DialogHeader>

        {/* Header Info */}
        <div className="space-y-4">
          {/* Title and Badges */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {escalation.asset_name}
              </h3>
              <p className="text-gray-600">
                {escalation.inspection_type.replace('_', ' ').toUpperCase()} Inspection
              </p>
            </div>
            <div className="flex gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getLevelColor(escalation.escalation_level)}`}>
                Level {escalation.escalation_level}
              </div>
              <Badge className={getSeverityColor(escalation.severity)}>
                {escalation.severity.toUpperCase()}
              </Badge>
              <Badge className={getStatusColor(escalation.status)}>
                {escalation.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-red-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Days Overdue</p>
                    <p className="text-2xl font-bold text-red-600">
                      {escalation.actual_overdue_days}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Scheduled Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(escalation.scheduled_date).split(',')[0]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Assigned To</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {escalation.assigned_to_name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              onClick={() => setShowReassignDialog(true)}
              variant="outline"
              size="sm"
              disabled={escalation.status === 'resolved'}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Reassign
            </Button>
            <Button
              onClick={handleSendReminder}
              variant="outline"
              size="sm"
              disabled={sendReminderMutation.isPending || escalation.status === 'resolved'}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
            <Button
              onClick={() => setShowResolveDialog(true)}
              variant="outline"
              size="sm"
              className="text-green-600 border-green-600 hover:bg-green-50"
              disabled={escalation.status === 'resolved'}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Resolved
            </Button>
            <Button
              onClick={() => setShowEscalateDialog(true)}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50"
              disabled={escalation.escalation_level === 3 || escalation.status === 'resolved'}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Escalate Higher
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4">
            {(['details', 'timeline', 'comments'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {escalation.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {escalation.notes}
                    </p>
                  </div>
                )}

                {escalation.last_reminder_sent && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Last Reminder</h4>
                    <p className="text-gray-700">
                      Sent on {formatDate(escalation.last_reminder_sent)}
                    </p>
                  </div>
                )}

                {escalation.severity === 'critical' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center text-red-800">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <p className="font-semibold">
                        Critical Finding - Immediate Action Required
                      </p>
                    </div>
                    <p className="text-red-700 text-sm mt-2">
                      This escalation involves a critical finding that requires immediate
                      attention and resolution.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {actionsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
                  </div>
                ) : actions && actions.length > 0 ? (
                  <div className="space-y-4">
                    {actions.map((action, index) => (
                      <div key={action.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            {getActionIcon(action.action_type)}
                          </div>
                          {index < actions.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900">
                              {action.action_type.replace('_', ' ').toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(action.created_at)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600">By {action.user_name}</p>
                          {action.details && (
                            <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                              {action.details}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No actions recorded yet
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'comments' && (
              <motion.div
                key="comments"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Add Comment */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add a comment
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your comment here..."
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      disabled={!comment.trim() || addCommentMutation.isPending}
                      size="sm"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Comment
                    </Button>
                  </div>
                </div>

                {/* Comments List */}
                {commentsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
                  </div>
                ) : comments && comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((commentItem) => (
                      <Card key={commentItem.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-gray-900">
                              {commentItem.user_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(commentItem.created_at)}
                            </p>
                          </div>
                          <p className="text-gray-700">{commentItem.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No comments yet. Be the first to add one!
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Resolve Dialog */}
        {showResolveDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full m-4">
              <CardHeader>
                <CardTitle>Mark as Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resolution Note (Optional)
                    </label>
                    <Textarea
                      value={resolveNote}
                      onChange={(e) => setResolveNote(e.target.value)}
                      placeholder="Add any notes about the resolution..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowResolveDialog(false);
                        setResolveNote('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleResolve} disabled={resolveMutation.isPending}>
                      Confirm Resolution
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Escalate Dialog */}
        {showEscalateDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full m-4">
              <CardHeader>
                <CardTitle>Escalate to Higher Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Escalation Reason *
                    </label>
                    <Textarea
                      value={escalateReason}
                      onChange={(e) => setEscalateReason(e.target.value)}
                      placeholder="Explain why this needs to be escalated..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowEscalateDialog(false);
                        setEscalateReason('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleEscalate}
                      disabled={!escalateReason.trim() || escalateMutation.isPending}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Confirm Escalation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reassign Dialog */}
        {showReassignDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full m-4">
              <CardHeader>
                <CardTitle>Reassign Inspection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Inspector *
                    </label>
                    <Select value={newInspectorId} onValueChange={setNewInspectorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inspector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Inspector 1</SelectItem>
                        <SelectItem value="2">Inspector 2</SelectItem>
                        <SelectItem value="3">Inspector 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason (Optional)
                    </label>
                    <Textarea
                      value={reassignReason}
                      onChange={(e) => setReassignReason(e.target.value)}
                      placeholder="Why is this being reassigned?"
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowReassignDialog(false);
                        setNewInspectorId('');
                        setReassignReason('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReassign}
                      disabled={!newInspectorId || reassignMutation.isPending}
                    >
                      Confirm Reassignment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
