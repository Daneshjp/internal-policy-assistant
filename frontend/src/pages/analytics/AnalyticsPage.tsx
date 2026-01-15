import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ClipboardCheck,
  TrendingUp,
  Clock,
  AlertTriangle,
  CalendarClock,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Building2,
  Users,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, subDays } from 'date-fns';

// Types

interface KPIData {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}

interface InspectionTrend {
  date: string;
  completed: number;
  inProgress: number;
  planned: number;
}

interface FindingsBySeverity {
  name: string;
  value: number;
  color: string;
}

interface AssetByCriticality {
  criticality: string;
  count: number;
}

interface InspectorPerformance {
  name: string;
  completed: number;
  avgTime: number;
  findings: number;
}

interface TopAsset {
  assetNumber: string;
  assetName: string;
  inspections: number;
  lastInspection: string;
  nextInspection: string;
}

interface CriticalFinding {
  id: number;
  assetName: string;
  description: string;
  severity: string;
  date: string;
  inspector: string;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<string>('30');
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [selectedAssetType, setSelectedAssetType] = useState<string>('all');
  const [selectedInspector, setSelectedInspector] = useState<string>('all');

  // Check role access
  if (user?.role !== 'team_leader' && user?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <p>Access restricted to Team Leaders and Administrators only.</p>
          </div>
        </div>
      </div>
    );
  }

  // Mock data - Replace with actual API calls
  const kpiData: KPIData[] = [
    {
      label: 'Total Inspections',
      value: 284,
      change: 12.5,
      trend: 'up',
      icon: ClipboardCheck,
      color: 'bg-blue-500',
    },
    {
      label: 'Completion Rate',
      value: '94.3%',
      change: 2.1,
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      label: 'Avg Time to Complete',
      value: '3.2h',
      change: -8.4,
      trend: 'up',
      icon: Clock,
      color: 'bg-purple-500',
    },
    {
      label: 'Critical Findings',
      value: 23,
      change: -15.2,
      trend: 'up',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      label: 'Overdue Inspections',
      value: 7,
      change: -12.5,
      trend: 'up',
      icon: CalendarClock,
      color: 'bg-orange-500',
    },
  ];

  const inspectionTrends: InspectionTrend[] = useMemo(() => {
    const days = parseInt(dateRange);
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - i - 1);
      return {
        date: format(date, 'MM/dd'),
        completed: Math.floor(Math.random() * 15) + 5,
        inProgress: Math.floor(Math.random() * 8) + 2,
        planned: Math.floor(Math.random() * 10) + 3,
      };
    });
  }, [dateRange]);

  const findingsBySeverity: FindingsBySeverity[] = [
    { name: 'Low', value: 145, color: '#10b981' },
    { name: 'Medium', value: 89, color: '#f59e0b' },
    { name: 'High', value: 34, color: '#ef4444' },
    { name: 'Critical', value: 23, color: '#dc2626' },
  ];

  const assetsByCriticality: AssetByCriticality[] = [
    { criticality: 'Low', count: 42 },
    { criticality: 'Medium', count: 67 },
    { criticality: 'High', count: 89 },
    { criticality: 'Critical', count: 34 },
  ];

  const inspectorPerformance: InspectorPerformance[] = [
    { name: 'Ahmed Al-Mansoori', completed: 45, avgTime: 2.8, findings: 12 },
    { name: 'Fatima Hassan', completed: 42, avgTime: 3.1, findings: 15 },
    { name: 'Mohammed Ali', completed: 38, avgTime: 3.5, findings: 10 },
    { name: 'Sarah Abdullah', completed: 35, avgTime: 2.9, findings: 14 },
    { name: 'Khalid Ibrahim', completed: 32, avgTime: 3.3, findings: 11 },
  ];

  const monthlyTrends = [
    { month: 'Jul', inspections: 68, findings: 45, avgTime: 3.5 },
    { month: 'Aug', inspections: 72, findings: 52, avgTime: 3.3 },
    { month: 'Sep', inspections: 78, findings: 48, avgTime: 3.2 },
    { month: 'Oct', inspections: 85, findings: 55, avgTime: 3.1 },
    { month: 'Nov', inspections: 89, findings: 51, avgTime: 3.0 },
    { month: 'Dec', inspections: 92, findings: 49, avgTime: 2.9 },
  ];

  const facilityDistribution = [
    { facility: 'Ruwais Refinery', inspections: 78, completion: 96 },
    { facility: 'Das Island', inspections: 65, completion: 94 },
    { facility: 'Jebel Dhanna', inspections: 54, completion: 92 },
    { facility: 'Bu Hasa', inspections: 47, completion: 95 },
    { facility: 'Shah Gas', inspections: 40, completion: 91 },
  ];

  const topAssets: TopAsset[] = [
    {
      assetNumber: 'PV-001',
      assetName: 'Pressure Vessel Alpha',
      inspections: 24,
      lastInspection: '2024-12-15',
      nextInspection: '2025-01-15',
    },
    {
      assetNumber: 'HX-045',
      assetName: 'Heat Exchanger Unit 3',
      inspections: 22,
      lastInspection: '2024-12-10',
      nextInspection: '2025-01-10',
    },
    {
      assetNumber: 'TK-012',
      assetName: 'Storage Tank B-12',
      inspections: 20,
      lastInspection: '2024-12-08',
      nextInspection: '2025-02-08',
    },
    {
      assetNumber: 'PP-089',
      assetName: 'Pipeline Section 89',
      inspections: 19,
      lastInspection: '2024-12-12',
      nextInspection: '2025-01-20',
    },
    {
      assetNumber: 'PMP-034',
      assetName: 'Centrifugal Pump 34',
      inspections: 18,
      lastInspection: '2024-12-05',
      nextInspection: '2025-01-25',
    },
  ];

  const criticalFindings: CriticalFinding[] = [
    {
      id: 1,
      assetName: 'PV-001 Pressure Vessel Alpha',
      description: 'Corrosion detected on outer shell exceeding 2mm depth',
      severity: 'Critical',
      date: '2024-12-15',
      inspector: 'Ahmed Al-Mansoori',
    },
    {
      id: 2,
      assetName: 'HX-045 Heat Exchanger',
      description: 'Tube leakage identified in cooling section',
      severity: 'High',
      date: '2024-12-14',
      inspector: 'Fatima Hassan',
    },
    {
      id: 3,
      assetName: 'TK-012 Storage Tank',
      description: 'Foundation settlement observed, structural assessment required',
      severity: 'Critical',
      date: '2024-12-13',
      inspector: 'Mohammed Ali',
    },
    {
      id: 4,
      assetName: 'PP-089 Pipeline',
      description: 'External coating degradation over 50% in multiple sections',
      severity: 'High',
      date: '2024-12-12',
      inspector: 'Sarah Abdullah',
    },
    {
      id: 5,
      assetName: 'PMP-034 Pump',
      description: 'Excessive vibration detected, bearing replacement needed',
      severity: 'Critical',
      date: '2024-12-11',
      inspector: 'Khalid Ibrahim',
    },
  ];

  const handleExportData = () => {
    // Implementation for exporting data to CSV/Excel
    const csvData = [
      ['Analytics Report', `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`],
      [],
      ['KPI Metrics'],
      ['Metric', 'Value', 'Change %'],
      ...kpiData.map((kpi) => [kpi.label, kpi.value, `${kpi.change}%`]),
      [],
      ['Top Assets by Inspection Frequency'],
      ['Asset Number', 'Asset Name', 'Total Inspections', 'Last Inspection', 'Next Inspection'],
      ...topAssets.map((asset) => [
        asset.assetNumber,
        asset.assetName,
        asset.inspections,
        asset.lastInspection,
        asset.nextInspection,
      ]),
    ];

    const csv = csvData.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6" data-tour="analytics-page">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Comprehensive insights and performance metrics
            </p>
          </div>
          <Button onClick={handleExportData} className="flex items-center gap-2" data-tour="export-button">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card data-tour="filters">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facility</label>
              <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Facilities</SelectItem>
                  <SelectItem value="ruwais">Ruwais Refinery</SelectItem>
                  <SelectItem value="das">Das Island</SelectItem>
                  <SelectItem value="jebel">Jebel Dhanna</SelectItem>
                  <SelectItem value="buhasa">Bu Hasa</SelectItem>
                  <SelectItem value="shah">Shah Gas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
              <Select value={selectedAssetType} onValueChange={setSelectedAssetType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pressure_vessel">Pressure Vessel</SelectItem>
                  <SelectItem value="pipeline">Pipeline</SelectItem>
                  <SelectItem value="tank">Tank</SelectItem>
                  <SelectItem value="pump">Pump</SelectItem>
                  <SelectItem value="heat_exchanger">Heat Exchanger</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inspector</label>
              <Select value={selectedInspector} onValueChange={setSelectedInspector}>
                <SelectTrigger>
                  <SelectValue placeholder="Select inspector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Inspectors</SelectItem>
                  {inspectorPerformance.map((inspector) => (
                    <SelectItem key={inspector.name} value={inspector.name}>
                      {inspector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" data-tour="kpi-cards">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{kpi.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{kpi.value}</p>
                    <div className="flex items-center gap-1">
                      {kpi.change > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          kpi.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {Math.abs(kpi.change)}%
                      </span>
                      <span className="text-sm text-gray-500">vs last period</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${kpi.color} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 ${kpi.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1: Inspections Over Time & Findings by Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-tour="inspections-trend">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Inspections Over Time
            </CardTitle>
            <CardDescription>Daily inspection trends for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={inspectionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="In Progress"
                />
                <Line
                  type="monotone"
                  dataKey="planned"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Planned"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-tour="findings-severity">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Findings by Severity
            </CardTitle>
            <CardDescription>Distribution of inspection findings by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={findingsBySeverity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {findingsBySeverity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Assets by Criticality & Inspector Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-tour="assets-criticality">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Assets by Criticality
            </CardTitle>
            <CardDescription>Distribution of assets based on criticality levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assetsByCriticality}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="criticality" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Asset Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-tour="inspector-performance">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Inspector Performance
            </CardTitle>
            <CardDescription>Comparison of inspector productivity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inspectorPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="findings" fill="#f59e0b" name="Findings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3: Facility Distribution & Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-tour="facility-distribution">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Facility-wise Distribution
            </CardTitle>
            <CardDescription>Inspection activity across facilities</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={facilityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="facility" />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="inspections" fill="#3b82f6" name="Inspections" />
                <Bar yAxisId="right" dataKey="completion" fill="#10b981" name="Completion %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-tour="monthly-trends">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Trends
            </CardTitle>
            <CardDescription>6-month performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="inspections"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Inspections"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="findings"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Findings"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgTime"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Avg Time (hrs)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Assets Table */}
        <Card data-tour="top-assets">
          <CardHeader>
            <CardTitle>Top 10 Assets by Inspection Frequency</CardTitle>
            <CardDescription>Most frequently inspected assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Asset
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Inspections
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Last
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Next
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topAssets.slice(0, 5).map((asset) => (
                    <tr key={asset.assetNumber} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {asset.assetNumber}
                          </div>
                          <div className="text-sm text-gray-500">{asset.assetName}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {asset.inspections}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {format(new Date(asset.lastInspection), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {format(new Date(asset.nextInspection), 'MMM dd, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Inspector Performance Table */}
        <Card data-tour="inspector-metrics">
          <CardHeader>
            <CardTitle>Inspector Performance Metrics</CardTitle>
            <CardDescription>Detailed inspector statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Inspector
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Completed
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Avg Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Findings
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inspectorPerformance.map((inspector) => (
                    <tr key={inspector.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {inspector.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {inspector.completed}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{inspector.avgTime}h</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {inspector.findings}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Findings Table */}
      <Card data-tour="critical-findings">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Recent Critical Findings
          </CardTitle>
          <CardDescription>High priority findings requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Asset
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Inspector
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {criticalFindings.map((finding) => (
                  <tr key={finding.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {finding.assetName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">
                      {finding.description}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          finding.severity === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {finding.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {format(new Date(finding.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{finding.inspector}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
