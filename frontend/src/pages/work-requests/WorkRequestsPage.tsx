import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, RefreshCw, LayoutGrid, LayoutList } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { workRequestService } from '@/services/workRequestService';
import { assetService } from '@/services/assetService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkRequestCard } from '@/components/work-requests/WorkRequestCard';
import { WorkRequestFilters } from '@/components/work-requests/WorkRequestFilters';
import { WorkRequestStats } from '@/components/work-requests/WorkRequestStats';
import { WorkRequestDialog } from '@/components/work-requests/WorkRequestDialog';
import { WorkRequestDetailDialog } from '@/components/work-requests/WorkRequestDetailDialog';
import type {
  WorkRequest,
  WorkRequestCreate,
  WorkRequestUpdate,
  WorkRequestStats as StatsType,
} from '@/types/work-request';
import type { Asset } from '@/types/asset';
import type { PaginatedResponse } from '@/types';

export default function WorkRequestsPage() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    wr_type: '',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedWorkRequest, setSelectedWorkRequest] = useState<WorkRequest | null>(null);

  const canCreateWR = user?.role === 'engineer' || user?.role === 'team_leader' || user?.role === 'admin';

  useEffect(() => {
    fetchWorkRequests();
    fetchStats();
    fetchAssets();
  }, [pagination.page, filters, activeTab]);

  const fetchWorkRequests = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Apply tab-specific filters
      let statusFilter = filters.status;
      if (activeTab === 'pending') {
        statusFilter = 'submitted';
      } else if (activeTab === 'in_progress') {
        statusFilter = 'in_progress';
      }

      const response: PaginatedResponse<WorkRequest> = await workRequestService.getWorkRequests({
        ...filters,
        status: statusFilter,
        page: pagination.page,
        page_size: pagination.page_size,
      });

      setWorkRequests(response.items);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (err) {
      setError('Failed to load work requests. Please try again.');
      showNotification('Failed to load work requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const statsData = await workRequestService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await assetService.getAssets({ page_size: 1000 });
      setAssets(response.items);
    } catch (err) {
      console.error('Failed to load assets:', err);
    }
  };

  const handleCreateWorkRequest = async (data: WorkRequestCreate) => {
    try {
      await workRequestService.createWorkRequest(data);
      showNotification('Work request created successfully', 'success');
      setCreateDialogOpen(false);
      fetchWorkRequests();
      fetchStats();
    } catch (err) {
      showNotification('Failed to create work request', 'error');
      throw err;
    }
  };

  const handleUpdateWorkRequest = async (data: WorkRequestUpdate) => {
    if (!selectedWorkRequest) return;

    try {
      await workRequestService.updateWorkRequest(selectedWorkRequest.id, data);
      showNotification('Work request updated successfully', 'success');
      setEditDialogOpen(false);
      setSelectedWorkRequest(null);
      fetchWorkRequests();
    } catch (err) {
      showNotification('Failed to update work request', 'error');
      throw err;
    }
  };

  const handleSubmitWorkRequest = async (id: number) => {
    try {
      await workRequestService.submitWorkRequest(id);
      showNotification('Work request submitted for approval', 'success');
      setDetailDialogOpen(false);
      fetchWorkRequests();
      fetchStats();
    } catch (err) {
      showNotification('Failed to submit work request', 'error');
      throw err;
    }
  };

  const handleApproveWorkRequest = async (id: number) => {
    try {
      await workRequestService.approveWorkRequest(id);
      showNotification('Work request approved', 'success');
      setDetailDialogOpen(false);
      fetchWorkRequests();
      fetchStats();
    } catch (err) {
      showNotification('Failed to approve work request', 'error');
      throw err;
    }
  };

  const handleRejectWorkRequest = async (id: number) => {
    try {
      await workRequestService.rejectWorkRequest(id);
      showNotification('Work request rejected', 'success');
      setDetailDialogOpen(false);
      fetchWorkRequests();
      fetchStats();
    } catch (err) {
      showNotification('Failed to reject work request', 'error');
      throw err;
    }
  };

  const handleDeleteWorkRequest = async (id: number) => {
    if (!confirm('Are you sure you want to delete this work request?')) {
      return;
    }

    try {
      await workRequestService.deleteWorkRequest(id);
      showNotification('Work request deleted', 'success');
      setDetailDialogOpen(false);
      fetchWorkRequests();
      fetchStats();
    } catch (err) {
      showNotification('Failed to delete work request', 'error');
      throw err;
    }
  };

  const handleCardClick = async (wr: WorkRequest) => {
    try {
      // Fetch full details
      const fullWR = await workRequestService.getWorkRequest(wr.id);
      setSelectedWorkRequest(fullWR);
      setDetailDialogOpen(true);
    } catch (err) {
      showNotification('Failed to load work request details', 'error');
    }
  };

  const handleEditClick = () => {
    setDetailDialogOpen(false);
    setEditDialogOpen(true);
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

  const handleRefresh = () => {
    fetchWorkRequests();
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12" data-tour="work-requests-page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Requests</h1>
              <p className="text-gray-600">
                Create and manage work requests from inspection findings
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="icon" onClick={handleRefresh} data-tour="refresh-button">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
              {canCreateWR && (
                <Button onClick={() => setCreateDialogOpen(true)} data-tour="create-wr-button">
                  <Plus className="h-4 w-4 mr-2" />
                  New Work Request
                </Button>
              )}
            </div>
          </div>

          {/* Statistics */}
          <WorkRequestStats stats={stats} isLoading={statsLoading} />

          {/* Filters */}
          <WorkRequestFilters filters={filters} onFiltersChange={setFilters} />
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          </TabsList>
        </Tabs>

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

        {/* Work Requests Grid */}
        {!isLoading && !error && workRequests.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {workRequests.map((wr) => (
                  <WorkRequestCard key={wr.id} workRequest={wr} onClick={handleCardClick} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {workRequests.map((wr) => (
                  <WorkRequestCard key={wr.id} workRequest={wr} onClick={handleCardClick} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && workRequests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No work requests found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.status || filters.priority || filters.wr_type
                ? 'Try adjusting your filters'
                : 'Get started by creating your first work request'}
            </p>
            {canCreateWR && !filters.search && !filters.status && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Work Request
              </Button>
            )}
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.page_size + 1} to{' '}
              {Math.min(pagination.page * pagination.page_size, pagination.total)} of{' '}
              {pagination.total} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={pagination.page >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <WorkRequestDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateWorkRequest}
        assets={assets}
      />

      <WorkRequestDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedWorkRequest(null);
        }}
        onSubmit={handleUpdateWorkRequest}
        workRequest={selectedWorkRequest || undefined}
        assets={assets}
      />

      <WorkRequestDetailDialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedWorkRequest(null);
        }}
        workRequest={selectedWorkRequest}
        onEdit={handleEditClick}
        onSubmit={handleSubmitWorkRequest}
        onApprove={handleApproveWorkRequest}
        onReject={handleRejectWorkRequest}
        onDelete={handleDeleteWorkRequest}
      />
    </div>
  );
}
