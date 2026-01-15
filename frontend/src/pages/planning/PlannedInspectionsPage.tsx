import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { InspectionCalendar } from '@/components/planning/InspectionCalendar';
import type { PlannedInspection } from '@/types/planning';

export const PlannedInspectionsPage: FC = () => {
  const [viewMode, setViewMode] = useState<'month' | 'quarter' | 'year'>('month');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data - replace with actual API call
  const mockInspections: PlannedInspection[] = Array.from({ length: 80 }, (_, i) => ({
    id: i + 1,
    monthly_plan_id: (i % 12) + 1,
    asset_id: (i % 30) + 1,
    inspection_type: ['routine', 'statutory', 'rbi', 'shutdown', 'emergency'][
      i % 5
    ] as PlannedInspection['inspection_type'],
    planned_date: new Date(
      2026,
      new Date().getMonth(),
      (i % 28) + 1,
      (i % 24)
    ).toISOString(),
    assigned_inspector_id: i % 3 === 0 ? (i % 10) + 1 : undefined,
    status: ['scheduled', 'assigned', 'in_progress', 'completed', 'overdue'][
      i % 5
    ] as PlannedInspection['status'],
    priority: ['low', 'medium', 'high', 'critical'][
      i % 4
    ] as PlannedInspection['priority'],
    estimated_duration_hours: 2 + (i % 6),
    notes: i % 5 === 0 ? 'Requires special equipment' : undefined,
    created_at: '2025-12-01T00:00:00Z',
    updated_at: '2026-01-13T00:00:00Z',
  }));

  const filteredInspections = mockInspections.filter((inspection) => {
    if (filterType !== 'all' && inspection.inspection_type !== filterType) {
      return false;
    }
    if (filterStatus !== 'all' && inspection.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const getStatusColor = (status: PlannedInspection['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: PlannedInspection['priority']) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="info">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Planned Inspections
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage scheduled inspections
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'quarter' ? 'default' : 'outline'}
              onClick={() => setViewMode('quarter')}
            >
              Quarter
            </Button>
            <Button
              variant={viewMode === 'year' ? 'default' : 'outline'}
              onClick={() => setViewMode('year')}
            >
              Year
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Inspection Type
                </label>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="routine">Routine</option>
                  <option value="statutory">Statutory</option>
                  <option value="rbi">RBI</option>
                  <option value="shutdown">Shutdown</option>
                  <option value="emergency">Emergency</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Inspector
                </label>
                <Select>
                  <option value="all">All Inspectors</option>
                  <option value="1">John Doe</option>
                  <option value="2">Jane Smith</option>
                  <option value="3">Bob Johnson</option>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-semibold">Calendar View</h2>
          </div>
          <InspectionCalendar
            inspections={filteredInspections}
            onDateClick={(date) => console.log('Date clicked:', date)}
            onInspectionClick={(inspection) =>
              console.log('Inspection clicked:', inspection)
            }
          />
        </div>

        {/* List View */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            Inspections List ({filteredInspections.length})
          </h2>
          <div className="space-y-3">
            {filteredInspections.slice(0, 20).map((inspection) => (
              <motion.div
                key={inspection.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${getStatusColor(
                  inspection.status
                )}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">
                        Inspection #{inspection.id}
                      </h3>
                      {getPriorityBadge(inspection.priority)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-1 font-medium capitalize">
                          {inspection.inspection_type}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Asset:</span>
                        <span className="ml-1 font-medium">
                          Asset #{inspection.asset_id}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <span className="ml-1 font-medium">
                          {new Date(inspection.planned_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-1 font-medium">
                          {inspection.estimated_duration_hours}h
                        </span>
                      </div>
                    </div>
                    {inspection.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        {inspection.notes}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {inspection.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
