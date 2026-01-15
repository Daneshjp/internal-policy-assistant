import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { AssignmentCard } from '@/components/teams/AssignmentCard';
import type { TeamAssignment, AssignmentBoardColumn } from '@/types/team';

export const AssignmentBoard: FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filterInspector, setFilterInspector] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Mock data - replace with actual API call
  const mockAssignments: TeamAssignment[] = [
    {
      id: 1,
      team_id: 1,
      planned_inspection_id: 101,
      assigned_at: '2026-01-10T00:00:00Z',
      assigned_by: 1,
      status: 'unassigned',
      team_name: 'Alpha Team',
      inspection_details: {
        asset_name: 'Pressure Vessel PV-101',
        inspection_type: 'routine',
        planned_date: '2026-01-20T00:00:00Z',
      },
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 2,
      team_id: 1,
      planned_inspection_id: 102,
      assigned_at: '2026-01-11T00:00:00Z',
      assigned_by: 1,
      status: 'assigned',
      team_name: 'Alpha Team',
      inspection_details: {
        asset_name: 'Tank TK-205',
        inspection_type: 'statutory',
        planned_date: '2026-01-22T00:00:00Z',
      },
      created_at: '2026-01-11T00:00:00Z',
      updated_at: '2026-01-11T00:00:00Z',
    },
    {
      id: 3,
      team_id: 2,
      planned_inspection_id: 103,
      assigned_at: '2026-01-12T00:00:00Z',
      assigned_by: 1,
      status: 'accepted',
      team_name: 'Bravo Team',
      inspection_details: {
        asset_name: 'Pipeline PL-301',
        inspection_type: 'rbi',
        planned_date: '2026-01-25T00:00:00Z',
      },
      notes: 'Requires special equipment',
      created_at: '2026-01-12T00:00:00Z',
      updated_at: '2026-01-12T00:00:00Z',
    },
    {
      id: 4,
      team_id: 2,
      planned_inspection_id: 104,
      assigned_at: '2026-01-12T00:00:00Z',
      assigned_by: 1,
      status: 'in_progress',
      team_name: 'Bravo Team',
      inspection_details: {
        asset_name: 'Heat Exchanger HX-401',
        inspection_type: 'routine',
        planned_date: '2026-01-15T00:00:00Z',
      },
      created_at: '2026-01-12T00:00:00Z',
      updated_at: '2026-01-13T00:00:00Z',
    },
    {
      id: 5,
      team_id: 1,
      planned_inspection_id: 105,
      assigned_at: '2026-01-10T00:00:00Z',
      assigned_by: 1,
      status: 'completed',
      team_name: 'Alpha Team',
      inspection_details: {
        asset_name: 'Pressure Vessel PV-103',
        inspection_type: 'shutdown',
        planned_date: '2026-01-12T00:00:00Z',
      },
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-13T00:00:00Z',
    },
  ];

  const [assignments, setAssignments] = useState<TeamAssignment[]>(mockAssignments);

  const columns: AssignmentBoardColumn[] = [
    { id: 'unassigned', title: 'Unassigned', status: 'unassigned', assignments: [] },
    { id: 'assigned', title: 'Assigned', status: 'assigned', assignments: [] },
    { id: 'accepted', title: 'Accepted', status: 'accepted', assignments: [] },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress', assignments: [] },
    { id: 'completed', title: 'Completed', status: 'completed', assignments: [] },
  ];

  // Group assignments by status
  const groupedColumns = columns.map((col) => ({
    ...col,
    assignments: assignments.filter((a) => a.status === col.status),
  }));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = Number(active.id);
    const newStatus = over.id as TeamAssignment['status'];

    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === activeId
          ? { ...assignment, status: newStatus }
          : assignment
      )
    );

    console.log(`Moved assignment ${activeId} to ${newStatus}`);
  };

  const activeAssignment = assignments.find((a) => a.id.toString() === activeId);

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignment Board</h1>
            <p className="text-gray-600 mt-2">
              Manage inspection assignments with drag and drop
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Inspector
                </label>
                <Select
                  value={filterInspector}
                  onChange={(e) => setFilterInspector(e.target.value)}
                >
                  <option value="all">All Inspectors</option>
                  <option value="1">John Doe</option>
                  <option value="2">Jane Smith</option>
                  <option value="3">Bob Johnson</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date Range
                </label>
                <Select>
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {groupedColumns.map((column) => (
              <div key={column.id}>
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>{column.title}</span>
                      <span className="text-sm font-normal bg-gray-100 px-2 py-1 rounded-full">
                        {column.assignments.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SortableContext
                      items={column.assignments.map((a) => a.id.toString())}
                      strategy={verticalListSortingStrategy}
                      id={column.status}
                    >
                      <div className="space-y-2 min-h-96">
                        {column.assignments.map((assignment) => (
                          <AssignmentCard
                            key={assignment.id}
                            assignment={assignment}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeAssignment && (
              <AssignmentCard assignment={activeAssignment} isDragging />
            )}
          </DragOverlay>
        </DndContext>

        {/* Mobile Instructions */}
        <div className="mt-6 md:hidden bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            On mobile, swipe cards left or right to move between columns
          </p>
        </div>
      </motion.div>
    </div>
  );
};
