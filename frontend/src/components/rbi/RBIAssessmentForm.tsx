import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ConsequenceFactors, ProbabilityFactors, RBIAssessmentCreate } from '@/types/rbi';

interface RBIAssessmentFormProps {
  assetId?: number;
  assetName?: string;
  onSubmit: (data: RBIAssessmentCreate) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function RBIAssessmentForm({
  assetId,
  assetName,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: RBIAssessmentFormProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<number | undefined>(assetId);
  const [consequenceFactors, setConsequenceFactors] = useState<ConsequenceFactors>({
    safety: 3,
    environmental: 3,
    production: 3,
    financial: 3,
  });
  const [probabilityFactors, setProbabilityFactors] = useState<ProbabilityFactors>({
    corrosion_rate: 3,
    age: 3,
    operating_conditions: 3,
    maintenance_history: 3,
  });
  const [notes, setNotes] = useState('');

  const handleConsequenceChange = (field: keyof ConsequenceFactors, value: number) => {
    setConsequenceFactors((prev) => ({ ...prev, [field]: value }));
  };

  const handleProbabilityChange = (field: keyof ProbabilityFactors, value: number) => {
    setProbabilityFactors((prev) => ({ ...prev, [field]: value }));
  };

  const calculateConsequenceScore = () => {
    return Math.round(
      (consequenceFactors.safety +
        consequenceFactors.environmental +
        consequenceFactors.production +
        consequenceFactors.financial) /
        4
    );
  };

  const calculateProbabilityScore = () => {
    return Math.round(
      (probabilityFactors.corrosion_rate +
        probabilityFactors.age +
        probabilityFactors.operating_conditions +
        probabilityFactors.maintenance_history) /
        4
    );
  };

  const getRiskLevel = (consequence: number, probability: number) => {
    const score = consequence * probability;
    if (score >= 20) return 'Critical';
    if (score >= 12) return 'High';
    if (score >= 6) return 'Medium';
    return 'Low';
  };

  const consequenceScore = calculateConsequenceScore();
  const probabilityScore = calculateProbabilityScore();
  const riskLevel = getRiskLevel(consequenceScore, probabilityScore);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) {
      alert('Please select an asset');
      return;
    }
    onSubmit({
      asset_id: selectedAssetId,
      consequence_factors: consequenceFactors,
      probability_factors: probabilityFactors,
      notes: notes || undefined,
    });
  };

  const renderSlider = (
    label: string,
    value: number,
    onChange: (value: number) => void,
    description: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-sm font-bold text-primary">{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
            ((value - 1) / 4) * 100
          }%, #e5e7eb ${((value - 1) / 4) * 100}%, #e5e7eb 100%)`,
        }}
      />
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">RBI Assessment</h2>
              {assetName && (
                <p className="text-sm text-gray-600 mt-1">Asset: {assetName}</p>
              )}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Asset Selection (if not provided) */}
            {!assetId && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Asset</CardTitle>
                  <CardDescription>Choose the asset to assess</CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    type="number"
                    placeholder="Enter Asset ID"
                    value={selectedAssetId || ''}
                    onChange={(e) => setSelectedAssetId(parseInt(e.target.value) || undefined)}
                    required
                  />
                </CardContent>
              </Card>
            )}

            {/* Consequence Factors */}
            <Card data-tour="rbi-consequence-factors">
              <CardHeader>
                <CardTitle>Consequence Factors</CardTitle>
                <CardDescription>
                  Rate the potential consequences of failure (1 = Low, 5 = High)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderSlider(
                  'Safety Impact',
                  consequenceFactors.safety,
                  (value) => handleConsequenceChange('safety', value),
                  'Potential impact on personnel safety'
                )}
                {renderSlider(
                  'Environmental Impact',
                  consequenceFactors.environmental,
                  (value) => handleConsequenceChange('environmental', value),
                  'Potential environmental damage'
                )}
                {renderSlider(
                  'Production Impact',
                  consequenceFactors.production,
                  (value) => handleConsequenceChange('production', value),
                  'Impact on production and operations'
                )}
                {renderSlider(
                  'Financial Impact',
                  consequenceFactors.financial,
                  (value) => handleConsequenceChange('financial', value),
                  'Direct and indirect financial losses'
                )}
              </CardContent>
            </Card>

            {/* Probability Factors */}
            <Card data-tour="rbi-probability-factors">
              <CardHeader>
                <CardTitle>Probability Factors</CardTitle>
                <CardDescription>
                  Rate the likelihood of failure (1 = Low, 5 = High)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderSlider(
                  'Corrosion Rate',
                  probabilityFactors.corrosion_rate,
                  (value) => handleProbabilityChange('corrosion_rate', value),
                  'Current corrosion rate and trends'
                )}
                {renderSlider(
                  'Asset Age',
                  probabilityFactors.age,
                  (value) => handleProbabilityChange('age', value),
                  'Age relative to expected service life'
                )}
                {renderSlider(
                  'Operating Conditions',
                  probabilityFactors.operating_conditions,
                  (value) => handleProbabilityChange('operating_conditions', value),
                  'Severity of operating environment'
                )}
                {renderSlider(
                  'Maintenance History',
                  probabilityFactors.maintenance_history,
                  (value) => handleProbabilityChange('maintenance_history', value),
                  'Quality and frequency of maintenance (inverse: 1=Good, 5=Poor)'
                )}
              </CardContent>
            </Card>

            {/* Risk Summary */}
            <Card className="border-2 border-primary" data-tour="rbi-risk-summary">
              <CardHeader>
                <CardTitle>Risk Assessment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Consequence Score</p>
                    <p className="text-3xl font-bold text-blue-600">{consequenceScore}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Probability Score</p>
                    <p className="text-3xl font-bold text-purple-600">{probabilityScore}</p>
                  </div>
                  <div
                    className={`p-4 rounded-lg text-center ${
                      riskLevel === 'Critical'
                        ? 'bg-red-800 text-white'
                        : riskLevel === 'High'
                        ? 'bg-red-500 text-white'
                        : riskLevel === 'Medium'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    <p className="text-sm opacity-90">Risk Level</p>
                    <p className="text-3xl font-bold">{riskLevel}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Risk Score Calculation:</p>
                  <p className="text-sm font-mono">
                    Risk Score = Consequence ({consequenceScore}) × Probability ({probabilityScore}) ={' '}
                    <span className="font-bold text-lg">{consequenceScore * probabilityScore}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>Optional notes about this assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full min-h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter any additional notes or observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedAssetId}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Assessment'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
