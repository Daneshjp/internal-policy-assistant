import { FC, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GanttChart } from '@/components/planning/GanttChart';
import { InspectionCalendar } from '@/components/planning/InspectionCalendar';
import type { AnnualPlan, QuarterlyPlan, MonthlyPlan, PlannedInspection } from '@/types/planning';

export const AnnualPlanDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('quarterly');

  // Mock data - replace with actual API call
  const plan: AnnualPlan = {
    id: Number(id),
    year: 2026,
    description: 'Annual inspection plan for 2026 covering all critical assets',
    target_inspections: 450,
    total_budget: 2500000,
    status: 'active',
    approved_by: 1,
    approved_at: '2026-01-01T00:00:00Z',
    created_at: '2025-12-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  const quarterlyPlans: QuarterlyPlan[] = [
    {
      id: 1,
      annual_plan_id: plan.id,
      quarter: 1,
      target_inspections: 110,
      status: 'completed',
      start_date: '2026-01-01',
      end_date: '2026-03-31',
      created_at: '2025-12-01T00:00:00Z',
      updated_at: '2026-03-31T00:00:00Z',
    },
    {
      id: 2,
      annual_plan_id: plan.id,
      quarter: 2,
      target_inspections: 115,
      status: 'active',
      start_date: '2026-04-01',
      end_date: '2026-06-30',
      created_at: '2025-12-01T00:00:00Z',
      updated_at: '2026-01-13T00:00:00Z',
    },
    {
      id: 3,
      annual_plan_id: plan.id,
      quarter: 3,
      target_inspections: 110,
      status: 'draft',
      start_date: '2026-07-01',
      end_date: '2026-09-30',
      created_at: '2025-12-01T00:00:00Z',
      updated_at: '2025-12-01T00:00:00Z',
    },
    {
      id: 4,
      annual_plan_id: plan.id,
      quarter: 4,
      target_inspections: 115,
      status: 'draft',
      start_date: '2026-10-01',
      end_date: '2026-12-31',
      created_at: '2025-12-01T00:00:00Z',
      updated_at: '2025-12-01T00:00:00Z',
    },
  ];

  const monthlyPlans: MonthlyPlan[] = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    quarterly_plan_id: Math.floor(i / 3) + 1,
    month: i + 1,
    year: 2026,
    target_inspections: Math.round(plan.target_inspections / 12),
    status: i < 3 ? 'completed' : i < 6 ? 'active' : 'draft',
    start_date: `2026-${String(i + 1).padStart(2, '0')}-01`,
    end_date: `2026-${String(i + 1).padStart(2, '0')}-28`,
    created_at: '2025-12-01T00:00:00Z',
    updated_at: '2026-01-13T00:00:00Z',
  }));

  const mockInspections: PlannedInspection[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    monthly_plan_id: (i % 12) + 1,
    asset_id: (i % 20) + 1,
    inspection_type: ['routine', 'statutory', 'rbi', 'shutdown'][i % 4] as PlannedInspection['inspection_type'],
    planned_date: new Date(2026, (i % 12), (i % 28) + 1).toISOString(),
    status: ['scheduled', 'assigned', 'in_progress', 'completed'][i % 4] as PlannedInspection['status'],
    priority: ['low', 'medium', 'high', 'critical'][i % 4] as PlannedInspection['priority'],
    estimated_duration_hours: 2 + (i % 6),
    created_at: '2025-12-01T00:00:00Z',
    updated_at: '2026-01-13T00:00:00Z',
  }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="outline"
          onClick={() => navigate('/plans/annual')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plans
        </Button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {plan.year} Annual Plan
              </h1>
              <p className="text-gray-600 mt-2">{plan.description}</p>
            </div>
            {getStatusBadge(plan.status)}
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Target Inspections</p>
                <p className="text-xl font-bold">{plan.target_inspections}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-xl font-bold">
                  ${plan.total_budget.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-xl font-bold">110</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Remaining</p>
                <p className="text-xl font-bold">340</p>
              </div>
            </div>
          </div>

          {plan.status === 'pending_approval' && (
            <div className="mt-4">
              <Button className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Approve Plan
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="quarterly" isActive={activeTab === 'quarterly'}>
              Quarterly Plans
            </TabsTrigger>
            <TabsTrigger value="monthly" isActive={activeTab === 'monthly'}>
              Monthly Plans
            </TabsTrigger>
            <TabsTrigger value="inspections" isActive={activeTab === 'inspections'}>
              Planned Inspections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quarterly">
            <div className="grid grid-cols-2 gap-4 mt-4">
              {quarterlyPlans.map((qp) => (
                <motion.div
                  key={qp.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Quarter {qp.quarter}</CardTitle>
                        {getStatusBadge(qp.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Target Inspections
                          </span>
                          <span className="font-semibold">
                            {qp.target_inspections}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Period</span>
                          <span className="font-semibold text-sm">
                            {new Date(qp.start_date).toLocaleDateString()} -{' '}
                            {new Date(qp.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monthly">
            <div className="mt-4">
              <InspectionCalendar
                inspections={mockInspections}
                onDateClick={(date) => console.log('Date clicked:', date)}
                onInspectionClick={(inspection) =>
                  console.log('Inspection clicked:', inspection)
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="inspections">
            <div className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inspection Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <GanttChart inspections={mockInspections} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Planned Inspections List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockInspections.slice(0, 10).map((inspection) => (
                      <div
                        key={inspection.id}
                        className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold">
                            Inspection #{inspection.id}
                          </p>
                          <p className="text-sm text-gray-600">
                            {inspection.inspection_type} - Asset #
                            {inspection.asset_id}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              inspection.status === 'completed'
                                ? 'success'
                                : 'default'
                            }
                          >
                            {inspection.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(
                              inspection.planned_date
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};
