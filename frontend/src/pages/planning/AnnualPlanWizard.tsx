import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { PlanWizardStep } from '@/components/planning/PlanWizardStep';
import type { PlanWizardData } from '@/types/planning';

export const AnnualPlanWizard: FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PlanWizardData>({
    year: new Date().getFullYear() + 1,
    description: '',
    total_budget: 0,
    target_inspections: 0,
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Creating annual plan:', formData);
    // API call would go here
    navigate('/plans/annual');
  };

  const updateFormData = (field: keyof PlanWizardData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const quarterBreakdown = Array.from({ length: 4 }, (_, i) => ({
    quarter: i + 1,
    inspections: Math.round(formData.target_inspections / 4),
  }));

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/plans/annual')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Annual Plan
          </h1>
          <p className="text-gray-600 mt-2">
            Step {currentStep} of {totalSteps}
          </p>
          <Progress value={progress} className="mt-4" />
        </div>

        {/* Step 1: Basic Info */}
        <PlanWizardStep
          title="Basic Information"
          description="Enter the basic details for the annual plan"
          isActive={currentStep === 1}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => updateFormData('year', Number(e.target.value))}
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 10}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Enter plan description..."
              />
            </div>
            <div>
              <Label htmlFor="budget">Total Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.total_budget}
                onChange={(e) =>
                  updateFormData('total_budget', Number(e.target.value))
                }
                min={0}
              />
            </div>
          </div>
        </PlanWizardStep>

        {/* Step 2: Target Inspections */}
        <PlanWizardStep
          title="Target Inspections"
          description="Set the target number of inspections for the year"
          isActive={currentStep === 2}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="target">Target Inspections Count</Label>
              <Input
                id="target"
                type="number"
                value={formData.target_inspections}
                onChange={(e) =>
                  updateFormData('target_inspections', Number(e.target.value))
                }
                min={0}
              />
              <p className="text-sm text-gray-500 mt-2">
                This will be automatically distributed across 4 quarters
              </p>
            </div>
          </div>
        </PlanWizardStep>

        {/* Step 3: Quarterly Breakdown Preview */}
        <PlanWizardStep
          title="Quarterly Breakdown"
          description="Preview of inspection distribution across quarters"
          isActive={currentStep === 3}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {quarterBreakdown.map((q) => (
                <div
                  key={q.quarter}
                  className="p-4 border rounded-lg bg-gray-50"
                >
                  <h3 className="font-semibold text-lg">Q{q.quarter}</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {q.inspections}
                  </p>
                  <p className="text-sm text-gray-600">inspections</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              The breakdown can be adjusted after plan creation
            </p>
          </div>
        </PlanWizardStep>

        {/* Step 4: Confirmation */}
        <PlanWizardStep
          title="Review and Confirm"
          description="Review the plan details before creating"
          isActive={currentStep === 4}
        >
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Year</p>
                  <p className="font-semibold text-lg">{formData.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Budget</p>
                  <p className="font-semibold text-lg">
                    ${formData.total_budget.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Target Inspections</p>
                  <p className="font-semibold text-lg">
                    {formData.target_inspections}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Per Quarter (avg)</p>
                  <p className="font-semibold text-lg">
                    {Math.round(formData.target_inspections / 4)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="mt-1">{formData.description}</p>
              </div>
            </div>
          </div>
        </PlanWizardStep>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Create Plan
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
