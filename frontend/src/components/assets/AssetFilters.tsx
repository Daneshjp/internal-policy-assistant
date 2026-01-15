import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FilterState {
  search: string;
  asset_type: string;
  criticality: string;
  status: string;
}

interface AssetFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function AssetFilters({ filters, onFiltersChange }: AssetFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      asset_type: '',
      criticality: '',
      status: '',
    });
  };

  const hasActiveFilters =
    filters.search || filters.asset_type || filters.criticality || filters.status;

  return (
    <Card>
      <CardContent className="p-4">
        {/* Search Bar - Always visible */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by asset code or name..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="default"
            onClick={() => setIsExpanded(!isExpanded)}
            className="whitespace-nowrap"
          >
            <Filter className="h-4 w-4 mr-2" />
            {isExpanded ? 'Hide' : 'Show'} Filters
          </Button>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">Asset Type</label>
              <Select
                value={filters.asset_type}
                onChange={(e) => handleChange('asset_type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="pressure_vessel">Pressure Vessel</option>
                <option value="pipeline">Pipeline</option>
                <option value="tank">Tank</option>
                <option value="pump">Pump</option>
                <option value="heat_exchanger">Heat Exchanger</option>
                <option value="valve">Valve</option>
                <option value="other">Other</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Criticality</label>
              <Select
                value={filters.criticality}
                onChange={(e) => handleChange('criticality', e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="under_maintenance">Under Maintenance</option>
                <option value="decommissioned">Decommissioned</option>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="md:col-span-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
