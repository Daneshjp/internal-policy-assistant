import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { InspectionCard } from '@/components/inspections/InspectionCard';
import { InspectionFilters } from '@/components/inspections/InspectionFilters';
import { InspectionDetailView } from '@/components/inspections/InspectionDetailView';
import {
  useInspections,
  useInspection,
  useStartInspection,
  useCompleteInspection,
} from '@/hooks/useInspections';

export default function InspectionsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    status: '',
    inspection_type: '',
    date_from: '',
    date_to: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 12,
  });

  // Fetch inspections list
  // Filter out empty string values to avoid validation errors
  // Only filter by inspector_id for inspector role, admins/team_leaders see all
  const shouldFilterByInspector = user?.role === 'inspector';
  const apiFilters = Object.fromEntries(
    Object.entries({
      ...filters,
      ...(shouldFilterByInspector && { inspector_id: user?.id }),
      skip: pagination.skip,
      limit: pagination.limit,
    }).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
  );

  const {
    data: inspections,
    isLoading,
    error,
    refetch,
  } = useInspections(apiFilters);

  // Fetch single inspection if ID is provided
  const {
    data: inspection,
    isLoading: inspectionLoading,
    error: inspectionError,
  } = useInspection(Number(id));

  // Mutations
  const startInspection = useStartInspection();
  const completeInspection = useCompleteInspection();

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination({ skip: 0, limit: 12 }); // Reset to first page
  };

  // Handle start inspection
  const handleStartInspection = async (inspectionId: number) => {
    try {
      await startInspection.mutateAsync(inspectionId);
      refetch();
    } catch (error) {
      console.error('Failed to start inspection:', error);
    }
  };

  // Handle complete inspection
  const handleCompleteInspection = async (inspectionId: number) => {
    try {
      await completeInspection.mutateAsync(inspectionId);
      refetch();
    } catch (error) {
      console.error('Failed to complete inspection:', error);
    }
  };

  // Pagination
  const totalInspections = inspections?.length || 0;
  const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;
  const hasMore = inspections && inspections.length === pagination.limit;

  const handlePreviousPage = () => {
    if (pagination.skip > 0) {
      setPagination((prev) => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }));
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPagination((prev) => ({ ...prev, skip: prev.skip + prev.limit }));
    }
  };

  // If viewing a single inspection
  if (id && !inspectionLoading && inspection) {
    return (
      <InspectionDetailView
        inspection={inspection}
        onStart={handleStartInspection}
        onComplete={handleCompleteInspection}
      />
    );
  }

  // Loading state for detail view
  if (id && inspectionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state for detail view
  if (id && inspectionError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700"
          >
            Failed to load inspection. Please try again.
          </motion.div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12" data-tour="inspections-page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Inspections</h1>
              <p className="text-gray-600">
                View and manage your assigned inspections
              </p>
            </div>
          </div>

          {/* Filters */}
          <InspectionFilters filters={filters} onFiltersChange={handleFiltersChange} />
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
            Failed to load inspections. Please try again.
          </motion.div>
        )}

        {/* Inspections Grid */}
        {!isLoading && !error && inspections && inspections.length > 0 && (
          <>
            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {inspections.map((inspection) => (
                <InspectionCard
                  key={inspection.id}
                  inspection={inspection}
                  onStart={handleStartInspection}
                  onComplete={handleCompleteInspection}
                />
              ))}
            </div>

            {/* Mobile List */}
            <div className="md:hidden space-y-4 mb-8">
              {inspections.map((inspection) => (
                <InspectionCard
                  key={inspection.id}
                  inspection={inspection}
                  onStart={handleStartInspection}
                  onComplete={handleCompleteInspection}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && inspections && inspections.length === 0 && (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inspections found</h3>
            <p className="text-gray-600 mb-4">
              {filters.status || filters.inspection_type || filters.date_from || filters.date_to || filters.search
                ? 'Try adjusting your filters to see more results'
                : 'You don\'t have any inspections assigned yet'}
            </p>
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalInspections > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between border-t pt-6"
            data-tour="inspection-pagination"
          >
            <p className="text-sm text-gray-600">
              Showing {pagination.skip + 1} to{' '}
              {Math.min(pagination.skip + pagination.limit, pagination.skip + totalInspections)}{' '}
              of {totalInspections}+ inspections
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={pagination.skip === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasMore}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
