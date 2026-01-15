import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlanCard } from '@/components/planning/PlanCard';
import { planningService } from '@/services/planningService';
import type { AnnualPlan } from '@/types/planning';

export const AnnualPlanPage: FC = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [plans, setPlans] = useState<AnnualPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchPlans();
  }, [selectedYear]);

  const fetchPlans = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await planningService.getAnnualPlans(selectedYear || undefined);
      setPlans(data);
    } catch (err) {
      setError('Failed to load annual plans');
      console.error('Error loading plans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const years = [2024, 2025, 2026, 2027];
  const filteredPlans = plans.filter(
    (plan) => selectedYear === 0 || plan.year === selectedYear
  );

  const handlePlanClick = (id: number) => {
    navigate(`/plans/annual/${id}`);
  };

  const handleCreatePlan = () => {
    navigate('/plans/annual/new');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Annual Plans</h1>
            <p className="text-gray-600 mt-2">
              Manage annual inspection planning and execution
            </p>
          </div>
          <Button onClick={handleCreatePlan} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Annual Plan
          </Button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Filter by Year</label>
          <Select
            value={selectedYear === 0 ? 'all' : selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(value === 'all' ? 0 : Number(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onClick={handlePlanClick} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No annual plans found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
