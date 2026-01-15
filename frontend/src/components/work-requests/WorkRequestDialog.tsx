import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WorkRequest, WorkRequestCreate, WorkRequestUpdate } from '@/types/work-request';
import type { Asset } from '@/types/asset';

interface WorkRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: WorkRequestCreate | WorkRequestUpdate) => Promise<void>;
  workRequest?: WorkRequest;
  assets?: Asset[];
}

export function WorkRequestDialog({
  open,
  onClose,
  onSubmit,
  workRequest,
  assets = [],
}: WorkRequestDialogProps) {
  const isEdit = !!workRequest;
  const [formData, setFormData] = useState<WorkRequestCreate>({
    title: '',
    description: '',
    priority: 'medium',
    wr_type: 'corrective',
    asset_id: undefined,
    estimated_cost: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (workRequest) {
      setFormData({
        title: workRequest.title,
        description: workRequest.description,
        priority: workRequest.priority,
        wr_type: workRequest.wr_type,
        asset_id: workRequest.asset_id,
        estimated_cost: workRequest.estimated_cost,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        wr_type: 'corrective',
        asset_id: undefined,
        estimated_cost: undefined,
      });
    }
    setErrors({});
  }, [workRequest, open]);

  const handleChange = (field: keyof WorkRequestCreate, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.estimated_cost && formData.estimated_cost < 0) {
      newErrors.estimated_cost = 'Cost must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to submit work request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Work Request' : 'Create Work Request'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the work request details below.'
              : 'Fill in the details to create a new work request.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter work request title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the work to be done..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange('priority', value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="wr_type">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.wr_type}
                onValueChange={(value) => handleChange('wr_type', value)}
              >
                <SelectTrigger id="wr_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrective">Corrective</SelectItem>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="replacement">Replacement</SelectItem>
                  <SelectItem value="investigation">Investigation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Asset */}
            <div className="space-y-2">
              <Label htmlFor="asset_id">Asset</Label>
              <Select
                value={formData.asset_id?.toString() || ''}
                onValueChange={(value) => handleChange('asset_id', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger id="asset_id">
                  <SelectValue placeholder="Select asset (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id.toString()}>
                      {asset.asset_name} ({asset.asset_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Cost */}
            <div className="space-y-2">
              <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
              <Input
                id="estimated_cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimated_cost || ''}
                onChange={(e) =>
                  handleChange('estimated_cost', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="0.00"
                className={errors.estimated_cost ? 'border-red-500' : ''}
              />
              {errors.estimated_cost && (
                <p className="text-sm text-red-500">{errors.estimated_cost}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{isEdit ? 'Update' : 'Create'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
