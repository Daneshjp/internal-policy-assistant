import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { assetService } from '@/services/assetService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Asset, AssetCreate, AssetUpdate, AssetType, AssetCriticality, AssetStatus } from '@/types/asset';

export default function AssetFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<AssetCreate>({
    asset_number: '',
    asset_name: '',
    asset_type: 'pressure_vessel',
    description: '',
    location: '',
    department: '',
    criticality: 'medium',
    status: 'active',
    manufacturer: '',
    model_number: '',
    serial_number: '',
    installation_date: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode && id) {
      fetchAsset();
    }
  }, [id, isEditMode]);

  const fetchAsset = async () => {
    setIsFetching(true);
    try {
      const asset: Asset = await assetService.getAsset(Number(id));
      setFormData({
        asset_number: asset.asset_number,
        asset_name: asset.asset_name,
        asset_type: asset.asset_type,
        description: asset.description || '',
        location: asset.location,
        department: asset.department,
        criticality: asset.criticality,
        status: asset.status,
        manufacturer: asset.manufacturer || '',
        model_number: asset.model_number || '',
        serial_number: asset.serial_number || '',
        installation_date: asset.installation_date || '',
      });
    } catch (err) {
      setError('Failed to load asset details');
    } finally {
      setIsFetching(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.asset_number.trim()) {
      errors.asset_number = 'Asset number is required';
    }
    if (!formData.asset_name.trim()) {
      errors.asset_name = 'Asset name is required';
    }
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode && id) {
        const updateData: AssetUpdate = {
          asset_name: formData.asset_name,
          asset_type: formData.asset_type,
          description: formData.description,
          location: formData.location,
          department: formData.department,
          criticality: formData.criticality,
          status: formData.status,
        };
        await assetService.updateAsset(Number(id), updateData);
        navigate(`/assets/${id}`);
      } else {
        const result = await assetService.createAsset(formData);
        navigate(`/assets/${result.id}`);
      }
    } catch (err) {
      setError(isEditMode ? 'Failed to update asset' : 'Failed to create asset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof AssetCreate, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading asset...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(isEditMode ? `/assets/${id}` : '/assets')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditMode ? 'Edit Asset' : 'Create New Asset'}
          </h1>
          <p className="text-gray-600">
            {isEditMode
              ? 'Update asset information and specifications'
              : 'Add a new asset to the inspection system'}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
              <CardDescription>
                Enter the details for the asset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="asset_number">
                        Asset Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="asset_number"
                        value={formData.asset_number}
                        onChange={(e) => handleChange('asset_number', e.target.value)}
                        placeholder="e.g., AST-2024-001"
                        disabled={isLoading || isEditMode}
                        className={validationErrors.asset_number ? 'border-red-500' : ''}
                      />
                      {validationErrors.asset_number && (
                        <p className="text-xs text-red-500">{validationErrors.asset_number}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="asset_name">
                        Asset Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="asset_name"
                        value={formData.asset_name}
                        onChange={(e) => handleChange('asset_name', e.target.value)}
                        placeholder="e.g., Heat Exchanger HX-101"
                        disabled={isLoading}
                        className={validationErrors.asset_name ? 'border-red-500' : ''}
                      />
                      {validationErrors.asset_name && (
                        <p className="text-xs text-red-500">{validationErrors.asset_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="asset_type">Asset Type</Label>
                      <Select
                        id="asset_type"
                        value={formData.asset_type}
                        onChange={(e) => handleChange('asset_type', e.target.value as AssetType)}
                        disabled={isLoading}
                      >
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
                      <Label htmlFor="criticality">Criticality</Label>
                      <Select
                        id="criticality"
                        value={formData.criticality}
                        onChange={(e) => handleChange('criticality', e.target.value as AssetCriticality)}
                        disabled={isLoading}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">
                        Location <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="e.g., Abu Dhabi Plant"
                        disabled={isLoading}
                        className={validationErrors.location ? 'border-red-500' : ''}
                      />
                      {validationErrors.location && (
                        <p className="text-xs text-red-500">{validationErrors.location}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">
                        Department <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                        placeholder="e.g., Operations"
                        disabled={isLoading}
                        className={validationErrors.department ? 'border-red-500' : ''}
                      />
                      {validationErrors.department && (
                        <p className="text-xs text-red-500">{validationErrors.department}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value as AssetStatus)}
                      disabled={isLoading}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="under_maintenance">Under Maintenance</option>
                      <option value="decommissioned">Decommissioned</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Enter asset description..."
                      rows={4}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Technical Information */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-semibold">Technical Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer">Manufacturer</Label>
                      <Input
                        id="manufacturer"
                        value={formData.manufacturer}
                        onChange={(e) => handleChange('manufacturer', e.target.value)}
                        placeholder="e.g., Siemens"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model_number">Model Number</Label>
                      <Input
                        id="model_number"
                        value={formData.model_number}
                        onChange={(e) => handleChange('model_number', e.target.value)}
                        placeholder="e.g., HX-5000"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="serial_number">Serial Number</Label>
                      <Input
                        id="serial_number"
                        value={formData.serial_number}
                        onChange={(e) => handleChange('serial_number', e.target.value)}
                        placeholder="e.g., SN123456789"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="installation_date">Installation Date</Label>
                      <Input
                        id="installation_date"
                        type="date"
                        value={formData.installation_date}
                        onChange={(e) => handleChange('installation_date', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(isEditMode ? `/assets/${id}` : '/assets')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                        {isEditMode ? 'Saving...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditMode ? 'Save Changes' : 'Create Asset'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
