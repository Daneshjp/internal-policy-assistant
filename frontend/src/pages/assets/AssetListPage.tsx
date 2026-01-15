import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { assetService } from '@/services/assetService';
import { Button } from '@/components/ui/button';
import { AssetCard } from '@/components/assets/AssetCard';
import { AssetFilters } from '@/components/assets/AssetFilters';
import type { Asset } from '@/types/asset';
import type { PaginatedResponse } from '@/types';

export default function AssetListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    asset_type: '',
    criticality: '',
    status: '',
  });

  const canCreateAsset = user?.role === 'team_leader' || user?.role === 'admin';

  useEffect(() => {
    fetchAssets();
  }, [pagination.page, filters]);

  const fetchAssets = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response: PaginatedResponse<Asset> = await assetService.getAssets({
        ...filters,
        page: pagination.page,
        page_size: pagination.page_size,
      });

      setAssets(response.items);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (err) {
      setError('Failed to load assets. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Assets</h1>
              <p className="text-gray-600">
                Manage and monitor all inspection assets
              </p>
            </div>
            {canCreateAsset && (
              <Button
                onClick={() => navigate('/assets/new')}
                className="mt-4 md:mt-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Asset
              </Button>
            )}
          </div>

          {/* Filters */}
          <AssetFilters filters={filters} onFiltersChange={setFilters} />
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

        {/* Asset Grid - Desktop */}
        {!isLoading && !error && assets.length > 0 && (
          <>
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>

            {/* Asset List - Mobile */}
            <div className="md:hidden space-y-4 mb-8">
              {assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && assets.length === 0 && (
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.asset_type || filters.criticality || filters.status
                ? 'Try adjusting your filters'
                : 'Get started by creating your first asset'}
            </p>
            {canCreateAsset && (
              <Button onClick={() => navigate('/assets/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Asset
              </Button>
            )}
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between border-t pt-6"
          >
            <p className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.page_size + 1} to{' '}
              {Math.min(pagination.page * pagination.page_size, pagination.total)} of{' '}
              {pagination.total} assets
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
    </div>
  );
}
