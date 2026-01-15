import { useState } from 'react';
import { AlertCircle, Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import type { FindingType, Severity } from '@/types/inspection';

interface FindingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (finding: {
    finding_type: FindingType;
    severity: Severity;
    description: string;
    location_on_asset: string;
    corrective_action_required: boolean;
    corrective_action_description?: string;
    corrective_action_deadline?: string;
  }, photos: File[]) => void;
  isLoading?: boolean;
}

export function FindingForm({ isOpen, onClose, onSubmit, isLoading }: FindingFormProps) {
  const [formData, setFormData] = useState({
    finding_type: 'defect' as FindingType,
    severity: 'medium' as Severity,
    description: '',
    location_on_asset: '',
    corrective_action_required: false,
    corrective_action_description: '',
    corrective_action_deadline: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.location_on_asset.trim()) {
      newErrors.location_on_asset = 'Location is required';
    }
    if (formData.corrective_action_required && !formData.corrective_action_description.trim()) {
      newErrors.corrective_action_description = 'Corrective action description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData, photos);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      finding_type: 'defect',
      severity: 'medium',
      description: '',
      location_on_asset: '',
      corrective_action_required: false,
      corrective_action_description: '',
      corrective_action_deadline: '',
    });
    setPhotos([]);
    setErrors({});
    onClose();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Finding</DialogTitle>
          <DialogDescription>
            Document a new finding for this inspection
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Finding Type */}
            <div className="space-y-2">
              <Label htmlFor="finding_type">Finding Type *</Label>
              <Select
                id="finding_type"
                value={formData.finding_type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, finding_type: e.target.value as FindingType }))
                }
              >
                <option value="defect">Defect</option>
                <option value="observation">Observation</option>
                <option value="recommendation">Recommendation</option>
                <option value="ok">OK</option>
              </Select>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label htmlFor="severity">Severity *</Label>
              <Select
                id="severity"
                value={formData.severity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, severity: e.target.value as Severity }))
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the finding in detail..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location on Asset *</Label>
              <Input
                id="location"
                placeholder="e.g., North face, 3m from top"
                value={formData.location_on_asset}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location_on_asset: e.target.value }))
                }
                className={errors.location_on_asset ? 'border-red-500' : ''}
              />
              {errors.location_on_asset && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.location_on_asset}
                </p>
              )}
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <Label htmlFor="photos">Photos</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('photos')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photos
                </Button>
                <span className="text-sm text-muted-foreground">
                  {photos.length} photo(s) selected
                </span>
              </div>
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Corrective Action Required */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="corrective_action"
                checked={formData.corrective_action_required}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    corrective_action_required: e.target.checked,
                  }))
                }
                className="h-4 w-4"
              />
              <Label htmlFor="corrective_action" className="cursor-pointer">
                Corrective Action Required
              </Label>
            </div>

            {/* Corrective Action Details */}
            {formData.corrective_action_required && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="corrective_action_description">
                    Corrective Action Description *
                  </Label>
                  <Textarea
                    id="corrective_action_description"
                    placeholder="Describe the corrective action required..."
                    value={formData.corrective_action_description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        corrective_action_description: e.target.value,
                      }))
                    }
                    rows={3}
                    className={errors.corrective_action_description ? 'border-red-500' : ''}
                  />
                  {errors.corrective_action_description && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.corrective_action_description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.corrective_action_deadline}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        corrective_action_deadline: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Finding'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
