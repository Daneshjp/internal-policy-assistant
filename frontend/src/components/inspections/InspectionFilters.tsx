import { Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface InspectionFiltersProps {
  filters: {
    status: string;
    inspection_type: string;
    date_from: string;
    date_to: string;
    search: string;
  };
  onFiltersChange: (filters: Partial<InspectionFiltersProps['filters']>) => void;
}

export function InspectionFilters({ filters, onFiltersChange }: InspectionFiltersProps) {
  const handleReset = () => {
    onFiltersChange({
      status: '',
      inspection_type: '',
      date_from: '',
      date_to: '',
      search: '',
    });
  };

  const hasActiveFilters =
    filters.status ||
    filters.inspection_type ||
    filters.date_from ||
    filters.date_to ||
    filters.search;

  return (
    <Card data-tour="inspection-filters">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="ml-auto text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Asset name or number..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => onFiltersChange({ status: value === 'all' ? '' : value })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inspection Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={filters.inspection_type || 'all'}
              onValueChange={(value) => onFiltersChange({ inspection_type: value === 'all' ? '' : value })}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="statutory">Statutory</SelectItem>
                <SelectItem value="rbi">RBI</SelectItem>
                <SelectItem value="shutdown">Shutdown</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <Label htmlFor="date_from">From Date</Label>
            <Input
              id="date_from"
              type="date"
              value={filters.date_from}
              onChange={(e) => onFiltersChange({ date_from: e.target.value })}
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label htmlFor="date_to">To Date</Label>
            <Input
              id="date_to"
              type="date"
              value={filters.date_to}
              onChange={(e) => onFiltersChange({ date_to: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
