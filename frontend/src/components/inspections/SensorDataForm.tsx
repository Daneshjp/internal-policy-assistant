import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks/useDebounce';
import type { SensorDataInput } from '@/types/inspection';

interface SensorDataFormProps {
  onSubmit: (data: SensorDataInput) => void;
  onAutoPredict?: (data: SensorDataInput) => void;
  isLoading?: boolean;
  autoPredict?: boolean;
  debounceMs?: number;
}

/**
 * Interactive form for entering sensor data during inspections.
 * Supports real-time predictions with debouncing and manual submission.
 */
export const SensorDataForm: FC<SensorDataFormProps> = ({
  onSubmit,
  onAutoPredict,
  isLoading = false,
  autoPredict = true,
  debounceMs = 800,
}) => {
  const [formData, setFormData] = useState<SensorDataInput>({
    pressure: undefined,
    temperature: undefined,
    wall_thickness: undefined,
    corrosion_rate: undefined,
    vibration: undefined,
    flow_rate: undefined,
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SensorDataInput, string>>>({});

  // Debounce form data for auto-prediction
  const debouncedFormData = useDebounce(formData, debounceMs);

  // Auto-predict when debounced data changes
  useEffect(() => {
    if (autoPredict && onAutoPredict) {
      // Only trigger if at least one sensor parameter has a value
      const hasData = Object.entries(debouncedFormData).some(
        ([key, value]) => key !== 'notes' && value !== undefined && value !== null && value !== ''
      );

      if (hasData) {
        onAutoPredict(debouncedFormData);
      }
    }
  }, [debouncedFormData, autoPredict, onAutoPredict]);

  // Handle input change
  const handleChange = (field: keyof SensorDataInput, value: string) => {
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    if (field === 'notes') {
      setFormData((prev) => ({ ...prev, [field]: value }));
    } else {
      // Parse numeric value
      const numValue = value === '' ? undefined : parseFloat(value);
      setFormData((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SensorDataInput, string>> = {};

    // Check if at least one sensor parameter is provided
    const hasData = Object.entries(formData).some(
      ([key, value]) => key !== 'notes' && value !== undefined && value !== null
    );

    if (!hasData) {
      newErrors.pressure = 'At least one sensor parameter is required';
    }

    // Validate ranges
    if (formData.pressure !== undefined) {
      if (formData.pressure < 0) newErrors.pressure = 'Must be non-negative';
      if (formData.pressure > 1000) newErrors.pressure = 'Value too high (max: 1000 bar)';
    }

    if (formData.temperature !== undefined) {
      if (formData.temperature < -273) newErrors.temperature = 'Below absolute zero';
      if (formData.temperature > 500) newErrors.temperature = 'Value too high (max: 500°C)';
    }

    if (formData.wall_thickness !== undefined) {
      if (formData.wall_thickness < 0) newErrors.wall_thickness = 'Must be non-negative';
      if (formData.wall_thickness > 100) newErrors.wall_thickness = 'Value too high (max: 100mm)';
    }

    if (formData.corrosion_rate !== undefined) {
      if (formData.corrosion_rate < 0) newErrors.corrosion_rate = 'Must be non-negative';
      if (formData.corrosion_rate > 10) newErrors.corrosion_rate = 'Value too high (max: 10mm/year)';
    }

    if (formData.vibration !== undefined) {
      if (formData.vibration < 0) newErrors.vibration = 'Must be non-negative';
      if (formData.vibration > 50) newErrors.vibration = 'Value too high (max: 50mm/s)';
    }

    if (formData.flow_rate !== undefined) {
      if (formData.flow_rate < 0) newErrors.flow_rate = 'Must be non-negative';
      if (formData.flow_rate > 1000) newErrors.flow_rate = 'Value too high (max: 1000m³/h)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle manual submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
    }
  };

  // Sensor parameter fields configuration
  const sensorFields = [
    { key: 'pressure' as const, label: 'Pressure', unit: 'bar', step: '0.01' },
    { key: 'temperature' as const, label: 'Temperature', unit: '°C', step: '0.1' },
    { key: 'wall_thickness' as const, label: 'Wall Thickness', unit: 'mm', step: '0.01' },
    { key: 'corrosion_rate' as const, label: 'Corrosion Rate', unit: 'mm/year', step: '0.0001' },
    { key: 'vibration' as const, label: 'Vibration', unit: 'mm/s', step: '0.01' },
    { key: 'flow_rate' as const, label: 'Flow Rate', unit: 'm³/h', step: '0.1' },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Sensor Data Entry
          </span>
          {autoPredict && (
            <motion.div
              className="flex items-center gap-2 text-xs text-green-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
            >
              <Zap className="h-3 w-3" />
              <span>Auto-predict active</span>
            </motion.div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sensor Parameters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sensorFields.map(({ key, label, unit, step }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="text-sm font-medium text-gray-700">
                  {label} <span className="text-gray-500">({unit})</span>
                </Label>
                <Input
                  id={key}
                  type="number"
                  step={step}
                  value={formData[key] ?? ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className={errors[key] ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors[key] && (
                  <p className="text-xs text-red-600">{errors[key]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Enter any additional observations or context..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-xs text-gray-500">
              {autoPredict
                ? `Auto-prediction triggers ${debounceMs}ms after typing stops`
                : 'Click the button to generate prediction'}
            </p>
            <Button type="submit" disabled={isLoading} className="min-w-[150px]">
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                  Analyzing...
                </>
              ) : (
                'Generate Prediction'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
