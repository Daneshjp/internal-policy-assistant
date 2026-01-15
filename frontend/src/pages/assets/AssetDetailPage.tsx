import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, FileText, History, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { assetService } from '@/services/assetService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InspectionTimeline } from '@/components/assets/InspectionTimeline';
import type { Asset } from '@/types/asset';
import type { Inspection } from '@/types/inspection';

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [inspectionHistory, setInspectionHistory] = useState<Inspection[]>([]);
  const [documents, setDocuments] = useState<Array<{ id: number; document_type: string; file_name: string; file_url: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const canEdit = user?.role === 'team_leader' || user?.role === 'admin';

  useEffect(() => {
    if (id) {
      fetchAssetDetails();
    }
  }, [id]);

  const fetchAssetDetails = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [assetData, historyData, docsData] = await Promise.all([
        assetService.getAsset(Number(id)),
        assetService.getAssetInspectionHistory(Number(id)),
        assetService.getAssetDocuments(Number(id)),
      ]);

      setAsset(assetData);
      setInspectionHistory(historyData);
      setDocuments(docsData);
    } catch (err) {
      setError('Failed to load asset details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCriticalityColor = (criticality: string) => {
    const colors: Record<string, 'destructive' | 'warning' | 'info' | 'secondary'> = {
      critical: 'destructive',
      high: 'warning',
      medium: 'info',
      low: 'secondary',
    };
    return colors[criticality] || 'secondary';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
      active: 'success',
      inactive: 'secondary',
      under_maintenance: 'warning',
      decommissioned: 'destructive',
    };
    return colors[status] || 'secondary';
  };

  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/assets')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assets
          </Button>
          <Card>
            <CardContent className="p-6">
              <p className="text-red-600">{error || 'Asset not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" onClick={() => navigate('/assets')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assets
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{asset.asset_name}</h1>
              <div className="flex items-center space-x-3 mb-3">
                <Badge variant={getCriticalityColor(asset.criticality)}>
                  {asset.criticality.toUpperCase()}
                </Badge>
                <Badge variant={getStatusColor(asset.status)}>
                  {formatType(asset.status)}
                </Badge>
              </div>
              <p className="text-gray-600">{asset.asset_number}</p>
            </div>
            {canEdit && (
              <Button onClick={() => navigate(`/assets/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Asset
              </Button>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="overview">
                <Info className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Information</CardTitle>
                  <CardDescription>Basic details and specifications</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Asset Type</p>
                    <p className="font-medium">{formatType(asset.asset_type)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="font-medium">{asset.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Department</p>
                    <p className="font-medium">{asset.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Criticality</p>
                    <Badge variant={getCriticalityColor(asset.criticality)}>
                      {asset.criticality.toUpperCase()}
                    </Badge>
                  </div>
                  {asset.manufacturer && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Manufacturer</p>
                      <p className="font-medium">{asset.manufacturer}</p>
                    </div>
                  )}
                  {asset.model_number && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Model Number</p>
                      <p className="font-medium">{asset.model_number}</p>
                    </div>
                  )}
                  {asset.serial_number && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Serial Number</p>
                      <p className="font-medium">{asset.serial_number}</p>
                    </div>
                  )}
                  {asset.installation_date && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Installation Date</p>
                      <p className="font-medium">
                        {new Date(asset.installation_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {asset.last_inspection_date && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Last Inspection</p>
                      <p className="font-medium">
                        {new Date(asset.last_inspection_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {asset.next_inspection_date && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Next Inspection</p>
                      <p className="font-medium">
                        {new Date(asset.next_inspection_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {asset.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{asset.description}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Inspection History Tab */}
            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inspection History</CardTitle>
                  <CardDescription>Timeline of past inspections</CardDescription>
                </CardHeader>
                <CardContent>
                  <InspectionTimeline inspections={inspectionHistory} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Technical documents and files</CardDescription>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No documents available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{doc.file_name}</p>
                              <p className="text-sm text-gray-500">{formatType(doc.document_type)}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.file_url} download>
                              Download
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
