import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Timer,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEscalations, useEscalationStats } from '@/hooks/useEscalations';
import { EscalationCard } from '@/components/escalations/EscalationCard';
import { EscalationDetailDialog } from '@/components/escalations/EscalationDetailDialog';
import type { Escalation, EscalationFilters } from '@/types/escalation';
import type { Severity } from '@/types/inspection';

export default function EscalationsPage() {
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<EscalationFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 12,
  });

  // Fetch escalations
  const {
    data: escalationsData,
    isLoading,
    error,
    refetch,
  } = useEscalations({
    ...filters,
    search: searchQuery,
    page: pagination.page,
    page_size: pagination.page_size,
  });

  // Fetch statistics
  const { data: stats } = useEscalationStats();

  // Handle filter changes
  const handleFilterChange = (key: keyof EscalationFilters, value: string) => {
    if (value === 'all') {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Calculate escalation level color
  const getEscalationLevelColor = (level: 1 | 2 | 3) => {
    switch (level) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 3:
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  // Calculate severity color
  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
    }
  };

  // Pagination
  const totalPages = escalationsData
    ? Math.ceil(escalationsData.total / pagination.page_size)
    : 0;

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

  const activeFiltersCount = Object.keys(filters).length + (searchQuery ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12" data-tour="escalations-page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Escalations</h1>
              <p className="text-gray-600">
                Manage overdue inspections and critical items requiring attention
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card data-tour="total-escalations">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Escalations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-gray-900">
                      {stats.total_escalations}
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-tour="level-3-escalations">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Level 3 (Critical)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-red-600">{stats.level_3}</div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-tour="resolved-this-week">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Resolved This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-green-600">
                      {stats.resolved_this_week}
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-tour="avg-resolution-time">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Avg. Resolution Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-gray-900">
                      {stats.average_resolution_days.toFixed(1)}
                      <span className="text-base font-normal text-gray-500 ml-1">days</span>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Timer className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by asset name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Escalation Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Escalation Level
                    </label>
                    <Select
                      value={filters.level?.toString() || 'all'}
                      onValueChange={(value) => handleFilterChange('level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All levels</SelectItem>
                        <SelectItem value="1">Level 1 (1-7 days)</SelectItem>
                        <SelectItem value="2">Level 2 (8-14 days)</SelectItem>
                        <SelectItem value="3">Level 3 (15+ days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity
                    </label>
                    <Select
                      value={filters.severity || 'all'}
                      onValueChange={(value) => handleFilterChange('severity', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All severities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All severities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <Select
                      value={filters.status || 'all'}
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="escalated">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
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
            Failed to load escalations. Please try again.
          </motion.div>
        )}

        {/* Escalations Grid */}
        {!isLoading && !error && escalationsData && escalationsData.items.length > 0 && (
          <>
            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {escalationsData.items.map((escalation) => (
                <EscalationCard
                  key={escalation.id}
                  escalation={escalation}
                  onClick={() => setSelectedEscalation(escalation)}
                  getLevelColor={getEscalationLevelColor}
                  getSeverityColor={getSeverityColor}
                />
              ))}
            </div>

            {/* Mobile List */}
            <div className="md:hidden space-y-4 mb-8">
              {escalationsData.items.map((escalation) => (
                <EscalationCard
                  key={escalation.id}
                  escalation={escalation}
                  onClick={() => setSelectedEscalation(escalation)}
                  getLevelColor={getEscalationLevelColor}
                  getSeverityColor={getSeverityColor}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && escalationsData && escalationsData.items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <CheckCircle2 className="mx-auto h-16 w-16" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No escalations found
            </h3>
            <p className="text-gray-600 mb-4">
              {activeFiltersCount > 0
                ? 'Try adjusting your filters to see more results'
                : 'Great! There are no active escalations at the moment'}
            </p>
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between border-t pt-6"
            data-tour="escalation-pagination"
          >
            <p className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.page_size + 1} to{' '}
              {Math.min(
                pagination.page * pagination.page_size,
                escalationsData?.total || 0
              )}{' '}
              of {escalationsData?.total || 0} escalations
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
      </div>

      {/* Escalation Detail Dialog */}
      {selectedEscalation && (
        <EscalationDetailDialog
          escalation={selectedEscalation}
          open={!!selectedEscalation}
          onClose={() => setSelectedEscalation(null)}
          onUpdate={() => {
            refetch();
            setSelectedEscalation(null);
          }}
          getLevelColor={getEscalationLevelColor}
          getSeverityColor={getSeverityColor}
        />
      )}
    </div>
  );
}
