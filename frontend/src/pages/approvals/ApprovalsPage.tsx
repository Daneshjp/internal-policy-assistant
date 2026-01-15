import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Calendar,
  User,
  Package,
  AlertTriangle,
  FileText,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { approvalService } from '@/services/approvalService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PendingApprovalItem, ApprovalWorkflow } from '@/types/approval';
import type { PaginatedResponse } from '@/types';

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<PendingApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApproval, setSelectedApproval] = useState<PendingApprovalItem | null>(null);
  const [workflowDetails, setWorkflowDetails] = useState<ApprovalWorkflow | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionComments, setActionComments] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });

  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    date_from: '',
    date_to: '',
  });

  const canApprove =
    user?.role === 'team_leader' ||
    user?.role === 'admin' ||
    user?.role === 'inspector' ||
    user?.role === 'engineer' ||
    user?.role === 'rbi_auditor';

  useEffect(() => {
    fetchApprovals();
  }, [pagination.page, filters]);

  const fetchApprovals = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response: PaginatedResponse<PendingApprovalItem> =
        await approvalService.getApprovals({
          ...filters,
          page: pagination.page,
          page_size: pagination.page_size,
        });

      setApprovals(response.items);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (err) {
      setError('Failed to load approvals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (approval: PendingApprovalItem) => {
    setSelectedApproval(approval);
    setIsDetailsOpen(true);
    setActionComments('');

    try {
      const workflow = await approvalService.getWorkflow(approval.workflow_id);
      setWorkflowDetails(workflow);
    } catch (err) {
      setError('Failed to load approval details.');
    }
  };

  const handleApprove = async (workflowId: number, comments?: string) => {
    setIsApproving(true);
    setError('');

    try {
      await approvalService.approve(workflowId, comments);
      setIsDetailsOpen(false);
      setSelectedApproval(null);
      setWorkflowDetails(null);
      setActionComments('');
      await fetchApprovals();
    } catch (err) {
      setError('Failed to approve. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (workflowId: number, comments: string) => {
    if (!comments.trim()) {
      setError('Rejection reason is required.');
      return;
    }

    setIsRejecting(true);
    setError('');

    try {
      await approvalService.reject(workflowId, comments);
      setIsDetailsOpen(false);
      setSelectedApproval(null);
      setWorkflowDetails(null);
      setActionComments('');
      await fetchApprovals();
    } catch (err) {
      setError('Failed to reject. Please try again.');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedItems.size === 0) return;

    const promises = Array.from(selectedItems).map((workflowId) =>
      approvalService.approve(workflowId)
    );

    try {
      await Promise.all(promises);
      setSelectedItems(new Set());
      await fetchApprovals();
    } catch (err) {
      setError('Some approvals failed. Please try again.');
    }
  };

  const toggleSelectItem = (workflowId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(workflowId)) {
      newSelected.delete(workflowId);
    } else {
      newSelected.add(workflowId);
    }
    setSelectedItems(newSelected);
  };

  const getSeverityBadge = (approval: PendingApprovalItem) => {
    if (approval.critical_findings > 0) {
      return (
        <Badge variant="destructive" className="ml-2">
          {approval.critical_findings} Critical
        </Badge>
      );
    }
    if (approval.high_findings > 0) {
      return (
        <Badge variant="warning" className="ml-2">
          {approval.high_findings} High
        </Badge>
      );
    }
    if (approval.medium_findings > 0) {
      return (
        <Badge variant="info" className="ml-2">
          {approval.medium_findings} Medium
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="ml-2">
        {approval.low_findings} Low
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="info">In Progress</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStageBadge = (stage?: string) => {
    if (!stage) return null;

    const stageLabels: Record<string, string> = {
      inspector: 'Inspector Review',
      engineer: 'Engineer Review',
      rbi: 'RBI Audit',
      team_leader: 'Team Leader Approval',
    };

    return (
      <Badge variant="outline" className="ml-2">
        {stageLabels[stage] || stage}
      </Badge>
    );
  };

  const totalPages = Math.ceil(pagination.total / pagination.page_size);

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.page < totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12" data-tour="approvals-page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Approvals</h1>
              <p className="text-gray-600">
                Review and approve inspection reports awaiting your decision
              </p>
            </div>
            {selectedItems.size > 0 && canApprove && (
              <div className="mt-4 md:mt-0 flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedItems.size} selected
                </span>
                <Button onClick={handleBulkApprove} size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Selected
                </Button>
              </div>
            )}
          </div>

          {/* Filters */}
          <div
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            data-tour="approvals-filters"
          >
            <div className="flex items-center mb-3">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value === 'all' ? '' : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <Select
                  value={filters.severity || 'all'}
                  onValueChange={(value) =>
                    setFilters({ ...filters, severity: value === 'all' ? '' : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date From
                </label>
                <Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) =>
                    setFilters({ ...filters, date_from: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date To
                </label>
                <Input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) =>
                    setFilters({ ...filters, date_to: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Approvals List */}
        {!isLoading && !error && approvals.length > 0 && (
          <>
            <div className="space-y-4 mb-8" data-tour="approvals-list">
              {approvals.map((approval) => (
                <motion.div
                  key={approval.workflow_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {canApprove && (
                          <input
                            type="checkbox"
                            checked={selectedItems.has(approval.workflow_id)}
                            onChange={() => toggleSelectItem(approval.workflow_id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-3"
                          />
                        )}
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {approval.report_number}
                        </h3>
                        {getStatusBadge(approval.workflow_status)}
                        {getStageBadge(approval.current_stage)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Package className="h-4 w-4 mr-2" />
                          <span>
                            <strong>Asset:</strong> {approval.asset_name}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>
                            <strong>Inspector:</strong> {approval.inspector_name}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            <strong>Inspection Date:</strong>{' '}
                            {formatDate(approval.inspection_date)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center mt-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <span>
                            <strong>Findings:</strong> {approval.findings_count} total
                          </span>
                          {getSeverityBadge(approval)}
                        </div>
                        {approval.submitted_at && (
                          <div className="flex items-center text-sm text-gray-500 ml-6">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Submitted {formatDate(approval.submitted_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(approval)}
                        data-tour="view-approval-details"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between border-t pt-6"
              >
                <p className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.page_size + 1} to{' '}
                  {Math.min(pagination.page * pagination.page_size, pagination.total)}{' '}
                  of {pagination.total} approvals
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={pagination.page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && approvals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <CheckCircle className="mx-auto h-16 w-16" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pending approvals
            </h3>
            <p className="text-gray-600 mb-4">
              {filters.status || filters.severity || filters.date_from || filters.date_to
                ? 'Try adjusting your filters'
                : 'All inspection reports have been reviewed'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Approval Details</DialogTitle>
            <DialogDescription>
              Review inspection report and provide your decision
            </DialogDescription>
          </DialogHeader>

          {selectedApproval && (
            <div className="space-y-6">
              {/* Report Information */}
              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Report Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Report Number:</span>
                    <p className="font-medium">{selectedApproval.report_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Asset:</span>
                    <p className="font-medium">{selectedApproval.asset_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Inspector:</span>
                    <p className="font-medium">{selectedApproval.inspector_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Inspection Date:</span>
                    <p className="font-medium">
                      {formatDate(selectedApproval.inspection_date)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Inspection Type:</span>
                    <p className="font-medium capitalize">
                      {selectedApproval.inspection_type?.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Stage:</span>
                    <p className="font-medium">
                      {getStageBadge(selectedApproval.current_stage)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Findings Summary */}
              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Findings Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-700">
                      {selectedApproval.critical_findings}
                    </p>
                    <p className="text-xs text-red-600">Critical</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-700">
                      {selectedApproval.high_findings}
                    </p>
                    <p className="text-xs text-orange-600">High</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-700">
                      {selectedApproval.medium_findings}
                    </p>
                    <p className="text-xs text-yellow-600">Medium</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">
                      {selectedApproval.low_findings}
                    </p>
                    <p className="text-xs text-green-600">Low</p>
                  </div>
                </div>
              </div>

              {/* Workflow Stages */}
              {workflowDetails && workflowDetails.stages.length > 0 && (
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Approval Workflow
                  </h4>
                  <div className="space-y-2">
                    {workflowDetails.stages.map((stage) => (
                      <div
                        key={stage.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm capitalize">
                            {stage.stage_name.replace('_', ' ')}
                          </p>
                          {stage.comments && (
                            <p className="text-xs text-gray-600 mt-1">
                              {stage.comments}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {stage.reviewed_at && (
                            <span className="text-xs text-gray-500">
                              {formatDate(stage.reviewed_at)}
                            </span>
                          )}
                          {stage.status === 'approved' && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {stage.status === 'rejected' && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          {stage.status === 'pending' && (
                            <Clock className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              {canApprove && (
                <div>
                  <label
                    htmlFor="comments"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Comments {!isApproving && isRejecting && '(Required for rejection)'}
                  </label>
                  <textarea
                    id="comments"
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add your comments or feedback..."
                    value={actionComments}
                    onChange={(e) => setActionComments(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <div className="flex items-center space-x-2 w-full justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailsOpen(false);
                  setActionComments('');
                }}
              >
                Cancel
              </Button>
              {canApprove && selectedApproval && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleReject(selectedApproval.workflow_id, actionComments)
                    }
                    disabled={isRejecting || isApproving}
                    data-tour="reject-approval"
                  >
                    {isRejecting ? (
                      <>
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() =>
                      handleApprove(selectedApproval.workflow_id, actionComments)
                    }
                    disabled={isApproving || isRejecting}
                    data-tour="approve-approval"
                  >
                    {isApproving ? (
                      <>
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
