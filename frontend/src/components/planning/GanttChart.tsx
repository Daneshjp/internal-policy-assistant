import { FC, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PlannedInspection } from '@/types/planning';

interface GanttChartProps {
  inspections: PlannedInspection[];
}

export const GanttChart: FC<GanttChartProps> = ({ inspections }) => {
  const chartData = useMemo(() => {
    const grouped = inspections.reduce((acc, inspection) => {
      const date = new Date(inspection.planned_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (!acc[date]) {
        acc[date] = {
          date,
          scheduled: 0,
          completed: 0,
          in_progress: 0,
          overdue: 0,
        };
      }

      if (inspection.status === 'scheduled') acc[date].scheduled++;
      else if (inspection.status === 'completed') acc[date].completed++;
      else if (inspection.status === 'in_progress') acc[date].in_progress++;
      else if (inspection.status === 'overdue') acc[date].overdue++;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }, [inspections]);

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="scheduled" fill="#3b82f6" name="Scheduled" stackId="a" />
          <Bar dataKey="in_progress" fill="#f59e0b" name="In Progress" stackId="a" />
          <Bar dataKey="completed" fill="#10b981" name="Completed" stackId="a" />
          <Bar dataKey="overdue" fill="#ef4444" name="Overdue" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
