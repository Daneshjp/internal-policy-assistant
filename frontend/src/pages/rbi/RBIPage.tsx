import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Download,
} from 'lucide-react';
import { rbiService } from '@/services/rbiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RiskMatrix } from '@/components/rbi/RiskMatrix';
import { RiskBadge } from '@/components/rbi/RiskBadge';
import { RBIAssessmentForm } from '@/components/rbi/RBIAssessmentForm';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type {
  RBIAssessment,
  RBIAssessmentCreate,
  RiskMatrixData,
  RiskDistribution,
  RiskTrend,
} from '@/types/rbi';

export default function RBIPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Data states
  const [assessments, setAssessments] = useState<RBIAssessment[]>([]);
  const [matrixData, setMatrixData] = useState<RiskMatrixData[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution | null>(null);
  const [riskTrends, setRiskTrends] = useState<RiskTrend[]>([]);
  const [highRiskAssets, setHighRiskAssets] = useState<RBIAssessment[]>([]);

  // UI states
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<{ consequence: number; probability: number } | null>(
    null
  );

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });

  useEffect(() => {
    fetchData();
  }, [pagination.page, filterRiskLevel]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Fetch all data in parallel
      const [assessmentsData, matrixResponse, distributionResponse, trendsResponse, highRiskResponse] =
        await Promise.all([
          rbiService.getAssessments({
            page: pagination.page,
            page_size: pagination.page_size,
            risk_level: filterRiskLevel || undefined,
          }),
          rbiService.getRiskMatrix(),
          rbiService.getRiskDistribution(),
          rbiService.getRiskTrends(90),
          rbiService.getHighRiskAssets(),
        ]);

      setAssessments(assessmentsData.items);
      setPagination((prev) => ({ ...prev, total: assessmentsData.total }));
      setMatrixData(matrixResponse);
      setRiskDistribution(distributionResponse);
      setRiskTrends(trendsResponse);
      setHighRiskAssets(highRiskResponse);
    } catch (err) {
      setError('Failed to load RBI data. Please try again.');
      console.error('Error fetching RBI data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssessment = async (data: RBIAssessmentCreate) => {
    setIsSubmitting(true);
    try {
      await rbiService.createAssessment(data);
      setShowAssessmentForm(false);
      fetchData();
    } catch (err) {
      console.error('Error creating assessment:', err);
      alert('Failed to create assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCellClick = (consequence: number, probability: number) => {
    setSelectedCell({ consequence, probability });
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      !searchTerm ||
      assessment.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.asset_type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCell =
      !selectedCell ||
      (assessment.consequence_score === selectedCell.consequence &&
        assessment.probability_score === selectedCell.probability);

    return matchesSearch && matchesCell;
  });

  const RISK_COLORS = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#ef4444',
    critical: '#991b1b',
  };

  const pieData = riskDistribution
    ? [
        { name: 'Low', value: riskDistribution.low, color: RISK_COLORS.low },
        { name: 'Medium', value: riskDistribution.medium, color: RISK_COLORS.medium },
        { name: 'High', value: riskDistribution.high, color: RISK_COLORS.high },
        { name: 'Critical', value: riskDistribution.critical, color: RISK_COLORS.critical },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading RBI data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" data-tour="rbi-page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            RBI (Risk-Based Inspection)
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Risk assessment and inspection prioritization
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setShowAssessmentForm(true)} data-tour="rbi-new-assessment">
            <Plus className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto" data-tour="rbi-tabs">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pagination.total}</div>
                <p className="text-xs text-muted-foreground">Active risk assessments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {riskDistribution?.critical || 0}
                </div>
                <p className="text-xs text-muted-foreground">Require immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {riskDistribution?.high || 0}
                </div>
                <p className="text-xs text-muted-foreground">Priority inspections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medium + Low</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(riskDistribution?.medium || 0) + (riskDistribution?.low || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Standard schedule</p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Distribution */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card data-tour="rbi-risk-distribution">
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Current risk level breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* High-Risk Assets */}
            <Card data-tour="rbi-high-risk-assets">
              <CardHeader>
                <CardTitle>High-Risk Assets</CardTitle>
                <CardDescription>Assets requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {highRiskAssets.slice(0, 5).map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{asset.asset_name}</p>
                        <p className="text-xs text-gray-500">{asset.asset_type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <p className="text-xs text-gray-500">Risk Score</p>
                          <p className="text-sm font-bold">{asset.risk_score}</p>
                        </div>
                        <RiskBadge riskLevel={asset.risk_level} size="sm" />
                      </div>
                    </div>
                  ))}
                  {highRiskAssets.length === 0 && (
                    <p className="text-center text-sm text-gray-500 py-8">
                      No high-risk assets found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterRiskLevel}
                    onChange={(e) => setFilterRiskLevel(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Risk Levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  {selectedCell && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCell(null)}
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessments List */}
          <div className="grid gap-4" data-tour="rbi-assessments-list">
            {filteredAssessments.map((assessment) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{assessment.asset_name}</h3>
                          <RiskBadge riskLevel={assessment.risk_level} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Asset Type</p>
                            <p className="font-medium">{assessment.asset_type}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Facility</p>
                            <p className="font-medium">{assessment.facility || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Consequence</p>
                            <p className="font-medium">{assessment.consequence_score}/5</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Probability</p>
                            <p className="font-medium">{assessment.probability_score}/5</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            Risk Score: <span className="font-bold">{assessment.risk_score}</span>
                          </span>
                          <span>Assessed: {new Date(assessment.assessment_date).toLocaleDateString()}</span>
                          {assessment.next_inspection_date && (
                            <span>
                              Next Inspection:{' '}
                              {new Date(assessment.next_inspection_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {filteredAssessments.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No assessments found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Risk Matrix Tab */}
        <TabsContent value="matrix" className="space-y-4">
          <Card data-tour="rbi-risk-matrix">
            <CardHeader>
              <CardTitle>5x5 Risk Matrix</CardTitle>
              <CardDescription>
                Click on a cell to view assets in that risk category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RiskMatrix data={matrixData} onCellClick={handleCellClick} />
              {selectedCell && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">
                    Showing assets with Consequence: {selectedCell.consequence}, Probability:{' '}
                    {selectedCell.probability}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card data-tour="rbi-risk-trends">
            <CardHeader>
              <CardTitle>Risk Trends (90 Days)</CardTitle>
              <CardDescription>Historical risk level distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={riskTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="critical"
                    stroke={RISK_COLORS.critical}
                    strokeWidth={2}
                    name="Critical"
                  />
                  <Line
                    type="monotone"
                    dataKey="high"
                    stroke={RISK_COLORS.high}
                    strokeWidth={2}
                    name="High"
                  />
                  <Line
                    type="monotone"
                    dataKey="medium"
                    stroke={RISK_COLORS.medium}
                    strokeWidth={2}
                    name="Medium"
                  />
                  <Line
                    type="monotone"
                    dataKey="low"
                    stroke={RISK_COLORS.low}
                    strokeWidth={2}
                    name="Low"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Level Comparison</CardTitle>
              <CardDescription>Current distribution by risk level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pieData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Assets">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assessment Form Modal */}
      <AnimatePresence>
        {showAssessmentForm && (
          <RBIAssessmentForm
            onSubmit={handleCreateAssessment}
            onCancel={() => setShowAssessmentForm(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
