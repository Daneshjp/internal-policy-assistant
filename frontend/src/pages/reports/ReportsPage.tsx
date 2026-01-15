import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Mail,
  Printer,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  TrendingUp,
  Calendar as CalendarIcon,
  Building,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

interface Report {
  id: number;
  asset: {
    name: string;
    number: string;
  };
  inspection_date: string;
  inspection_type: string;
  inspector: {
    name: string;
    email: string;
  };
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  findings_count: number;
  severity_breakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  created_at: string;
  findings?: Array<{
    id: number;
    type: string;
    severity: string;
    description: string;
    location: string;
    photos: string[];
    corrective_action_required: boolean;
    corrective_action_description?: string;
  }>;
}

const MOCK_REPORTS: Report[] = [
  {
    id: 1,
    asset: { name: 'Pressure Vessel PV-101', number: 'PV-101' },
    inspection_date: '2024-01-15',
    inspection_type: 'routine',
    inspector: { name: 'John Smith', email: 'john.smith@adnoc.ae' },
    status: 'approved',
    findings_count: 3,
    severity_breakdown: { critical: 1, high: 1, medium: 1, low: 0 },
    created_at: '2024-01-15T14:30:00Z',
  },
  {
    id: 2,
    asset: { name: 'Heat Exchanger HX-202', number: 'HX-202' },
    inspection_date: '2024-01-14',
    inspection_type: 'rbi',
    inspector: { name: 'Sarah Johnson', email: 'sarah.johnson@adnoc.ae' },
    status: 'submitted',
    findings_count: 5,
    severity_breakdown: { critical: 0, high: 2, medium: 2, low: 1 },
    created_at: '2024-01-14T10:15:00Z',
  },
  {
    id: 3,
    asset: { name: 'Storage Tank TK-303', number: 'TK-303' },
    inspection_date: '2024-01-13',
    inspection_type: 'statutory',
    inspector: { name: 'Mike Wilson', email: 'mike.wilson@adnoc.ae' },
    status: 'approved',
    findings_count: 2,
    severity_breakdown: { critical: 0, high: 0, medium: 2, low: 0 },
    created_at: '2024-01-13T16:45:00Z',
  },
  {
    id: 4,
    asset: { name: 'Pipeline P-404', number: 'P-404' },
    inspection_date: '2024-01-12',
    inspection_type: 'routine',
    inspector: { name: 'John Smith', email: 'john.smith@adnoc.ae' },
    status: 'draft',
    findings_count: 1,
    severity_breakdown: { critical: 0, high: 0, medium: 1, low: 0 },
    created_at: '2024-01-12T09:20:00Z',
  },
  {
    id: 5,
    asset: { name: 'Compressor C-505', number: 'C-505' },
    inspection_date: '2024-01-11',
    inspection_type: 'emergency',
    inspector: { name: 'Sarah Johnson', email: 'sarah.johnson@adnoc.ae' },
    status: 'approved',
    findings_count: 7,
    severity_breakdown: { critical: 2, high: 3, medium: 1, low: 1 },
    created_at: '2024-01-11T11:30:00Z',
  },
];

export default function ReportsPage() {
  const [selectedTab, setSelectedTab] = useState('list');
  const [filters, setFilters] = useState({
    status: '',
    date_from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    date_to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    asset: '',
    inspector: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
  });
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter reports based on criteria
  const filteredReports = MOCK_REPORTS.filter((report) => {
    if (filters.status && report.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !report.asset.name.toLowerCase().includes(searchLower) &&
        !report.asset.number.toLowerCase().includes(searchLower) &&
        !report.inspector.name.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.ceil(filteredReports.length / pagination.page_size);
  const paginatedReports = filteredReports.slice(
    (pagination.page - 1) * pagination.page_size,
    pagination.page * pagination.page_size
  );

  const getStatusVariant = (
    status: string
  ): 'success' | 'warning' | 'info' | 'destructive' | 'secondary' => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'submitted':
        return 'info';
      case 'draft':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'submitted':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleExportPDF = (reportId: number) => {
    console.log('Export to PDF:', reportId);
    // TODO: Implement PDF export via backend API
    alert('PDF export will be implemented with backend integration');
  };

  const handleExportExcel = (reportId: number) => {
    console.log('Export to Excel:', reportId);
    // Simple CSV export for now
    const report = MOCK_REPORTS.find((r) => r.id === reportId);
    if (!report) return;

    const csvContent = [
      ['Field', 'Value'],
      ['Report ID', report.id],
      ['Asset', report.asset.name],
      ['Asset Number', report.asset.number],
      ['Inspection Date', report.inspection_date],
      ['Type', formatType(report.inspection_type)],
      ['Inspector', report.inspector.name],
      ['Status', report.status.toUpperCase()],
      ['Findings Count', report.findings_count],
      ['Critical Findings', report.severity_breakdown.critical],
      ['High Findings', report.severity_breakdown.high],
      ['Medium Findings', report.severity_breakdown.medium],
      ['Low Findings', report.severity_breakdown.low],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportId}-${report.asset.number}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = (reportId: number) => {
    console.log('Print report:', reportId);
    const report = MOCK_REPORTS.find((r) => r.id === reportId);
    if (!report) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inspection Report - ${report.asset.number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .section { margin: 20px 0; }
          .label { font-weight: bold; color: #666; }
          .value { margin-left: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>ADNOC Inspection Report</h1>
        <div class="section">
          <div><span class="label">Report ID:</span><span class="value">${report.id}</span></div>
          <div><span class="label">Asset:</span><span class="value">${report.asset.name}</span></div>
          <div><span class="label">Asset Number:</span><span class="value">${report.asset.number}</span></div>
          <div><span class="label">Inspection Date:</span><span class="value">${format(new Date(report.inspection_date), 'MMMM dd, yyyy')}</span></div>
          <div><span class="label">Type:</span><span class="value">${formatType(report.inspection_type)}</span></div>
          <div><span class="label">Inspector:</span><span class="value">${report.inspector.name}</span></div>
          <div><span class="label">Status:</span><span class="value">${report.status.toUpperCase()}</span></div>
        </div>
        <div class="section">
          <h2>Findings Summary</h2>
          <table>
            <tr><th>Severity</th><th>Count</th></tr>
            <tr><td>Critical</td><td>${report.severity_breakdown.critical}</td></tr>
            <tr><td>High</td><td>${report.severity_breakdown.high}</td></tr>
            <tr><td>Medium</td><td>${report.severity_breakdown.medium}</td></tr>
            <tr><td>Low</td><td>${report.severity_breakdown.low}</td></tr>
            <tr><th>Total</th><th>${report.findings_count}</th></tr>
          </table>
        </div>
        <script>window.print(); window.onafterprint = function() { window.close(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleEmail = (reportId: number) => {
    console.log('Email report:', reportId);
    // TODO: Implement email via backend API
    alert('Email functionality will be implemented with backend integration');
  };

  // Analytics data
  const statusData = [
    { name: 'Approved', value: MOCK_REPORTS.filter((r) => r.status === 'approved').length },
    { name: 'Submitted', value: MOCK_REPORTS.filter((r) => r.status === 'submitted').length },
    { name: 'Draft', value: MOCK_REPORTS.filter((r) => r.status === 'draft').length },
    { name: 'Rejected', value: MOCK_REPORTS.filter((r) => r.status === 'rejected').length },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#6b7280', '#ef4444'];

  const timelineData = [
    { date: '2024-01-11', reports: 1 },
    { date: '2024-01-12', reports: 1 },
    { date: '2024-01-13', reports: 1 },
    { date: '2024-01-14', reports: 1 },
    { date: '2024-01-15', reports: 1 },
  ];

  const assetFindingsData = MOCK_REPORTS.map((r) => ({
    asset: r.asset.number,
    findings: r.findings_count,
  }))
    .sort((a, b) => b.findings - a.findings)
    .slice(0, 5);

  const stats = {
    total: MOCK_REPORTS.length,
    approved: MOCK_REPORTS.filter((r) => r.status === 'approved').length,
    submitted: MOCK_REPORTS.filter((r) => r.status === 'submitted').length,
    critical_findings: MOCK_REPORTS.reduce((sum, r) => sum + r.severity_breakdown.critical, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12" data-tour="reports-page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Inspection Reports</h1>
              <p className="text-gray-600">View, analyze, and export inspection reports</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                data-tour="toggle-filters"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold">{stats.approved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{stats.submitted}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Critical Findings</p>
                    <p className="text-2xl font-bold">{stats.critical_findings}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="search">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="search"
                          placeholder="Search reports..."
                          value={filters.search}
                          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => setFilters({ ...filters, status: value })}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date_from">Date From</Label>
                      <Input
                        id="date_from"
                        type="date"
                        value={filters.date_from}
                        onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFilters({
                          status: '',
                          date_from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                          date_to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
                          asset: '',
                          inspector: '',
                          search: '',
                        })
                      }
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 gap-2">
            <TabsTrigger value="list" data-tour="reports-list-tab">
              <FileText className="h-4 w-4 mr-2" />
              Reports List
            </TabsTrigger>
            <TabsTrigger value="analytics" data-tour="reports-analytics-tab">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Reports List Tab */}
          <TabsContent value="list" className="space-y-4">
            {paginatedReports.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                    <p className="text-gray-600">
                      {filters.search || filters.status
                        ? 'Try adjusting your filters'
                        : 'No inspection reports available yet'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Report ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Asset
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Inspector
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Findings
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedReports.map((report) => (
                              <motion.tr
                                key={report.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                whileHover={{ backgroundColor: '#f9fafb' }}
                                className="cursor-pointer"
                                onClick={() => setSelectedReport(report)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  #{report.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {report.asset.name}
                                  </div>
                                  <div className="text-sm text-gray-500">{report.asset.number}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {format(new Date(report.inspection_date), 'MMM dd, yyyy')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {report.inspector.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge variant={getStatusVariant(report.status)}>
                                    {getStatusIcon(report.status)}
                                    {report.status.toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex gap-1">
                                    {report.severity_breakdown.critical > 0 && (
                                      <Badge variant="destructive" className="text-xs">
                                        {report.severity_breakdown.critical} Critical
                                      </Badge>
                                    )}
                                    {report.severity_breakdown.high > 0 && (
                                      <Badge variant="warning" className="text-xs">
                                        {report.severity_breakdown.high} High
                                      </Badge>
                                    )}
                                    {report.findings_count === 0 && (
                                      <Badge variant="success" className="text-xs">
                                        No Issues
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setSelectedReport(report)}
                                      title="View Report"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleExportPDF(report.id)}
                                      title="Export PDF"
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handlePrint(report.id)}
                                      title="Print"
                                    >
                                      <Printer className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {paginatedReports.map((report) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => setSelectedReport(report)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-base mb-1">
                                {report.asset.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {report.asset.number}
                              </p>
                            </div>
                            <Badge variant={getStatusVariant(report.status)}>
                              {report.status.toUpperCase()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>{format(new Date(report.inspection_date), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{report.inspector.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              <span>{report.findings_count} findings</span>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportPDF(report.id);
                                }}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                PDF
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportExcel(report.id);
                                }}
                              >
                                <FileSpreadsheet className="h-3 w-3 mr-1" />
                                Excel
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrint(report.id);
                                }}
                              >
                                <Printer className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <p className="text-sm text-gray-600">
                      Showing {(pagination.page - 1) * pagination.page_size + 1} to{' '}
                      {Math.min(pagination.page * pagination.page_size, filteredReports.length)} of{' '}
                      {filteredReports.length} reports
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
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
                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                        disabled={pagination.page === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reports by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Reports by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Reports Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Reports Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                      />
                      <YAxis />
                      <Tooltip labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="reports"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Assets by Findings */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Top Assets by Findings Count</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={assetFindingsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="asset" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="findings" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Inspection Report #{selectedReport.id}</DialogTitle>
                <DialogDescription>
                  {selectedReport.asset.name} - {selectedReport.asset.number}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Report Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Asset</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedReport.asset.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {selectedReport.asset.number}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Inspection Date</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(selectedReport.inspection_date), 'MMMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Inspector</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedReport.inspector.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {selectedReport.inspector.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatType(selectedReport.inspection_type)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge variant={getStatusVariant(selectedReport.status)}>
                        {getStatusIcon(selectedReport.status)}
                        {selectedReport.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Findings</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedReport.findings_count}</span>
                    </div>
                  </div>
                </div>

                {/* Findings Summary */}
                <div>
                  <Label className="text-lg font-semibold mb-3 block">Findings Summary</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Critical</p>
                          <p className="text-2xl font-bold text-red-600">
                            {selectedReport.severity_breakdown.critical}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">High</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {selectedReport.severity_breakdown.high}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Medium</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {selectedReport.severity_breakdown.medium}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Low</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {selectedReport.severity_breakdown.low}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button onClick={() => handleExportPDF(selectedReport.id)} data-tour="export-pdf">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportExcel(selectedReport.id)}
                    data-tour="export-excel"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePrint(selectedReport.id)}
                    data-tour="print-report"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleEmail(selectedReport.id)}
                    data-tour="email-report"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
