import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvailabilityDay } from '@/components/teams/AvailabilityDay';
import type { InspectorAvailability } from '@/types/team';

export const AvailabilityCalendar: FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedInspector, setSelectedInspector] = useState<string>('1');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');

  // Mock data - replace with actual API call
  const mockAvailability: InspectorAvailability[] = [
    {
      id: 1,
      inspector_id: 1,
      date: '2026-01-15',
      is_available: false,
      reason: 'Annual leave',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 2,
      inspector_id: 1,
      date: '2026-01-16',
      is_available: false,
      reason: 'Annual leave',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 3,
      inspector_id: 1,
      date: '2026-01-20',
      is_available: false,
      reason: 'Training',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
  ];

  const inspectors = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Bob Johnson' },
    { id: 4, name: 'Alice Williams' },
  ];

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const getAvailabilityForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return mockAvailability.find(
      (a) =>
        a.inspector_id === Number(selectedInspector) && a.date === dateStr
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const availability = getAvailabilityForDate(date);
    setReason(availability?.reason || '');
    setShowModal(true);
  };

  const handleSaveAvailability = () => {
    console.log('Saving availability:', {
      date: selectedDate,
      inspector_id: selectedInspector,
      is_available: false,
      reason,
    });
    setShowModal(false);
    setReason('');
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(
      <div key={`empty-${i}`} className="p-2 border border-gray-200 bg-gray-50" />
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const availability = getAvailabilityForDate(date);
    const isAvailable = availability ? availability.is_available : true;
    const isToday = new Date().toDateString() === date.toDateString();

    days.push(
      <div key={day} className="p-1">
        <AvailabilityDay
          date={date}
          isAvailable={isAvailable}
          reason={availability?.reason}
          onClick={handleDateClick}
          isSelected={selectedDate?.toDateString() === date.toDateString()}
          isToday={isToday}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Inspector Availability
          </h1>
          <p className="text-gray-600 mt-2">
            Manage inspector availability and leave schedules
          </p>
        </div>

        {/* Inspector Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Select Inspector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedInspector}
              onChange={(e) => setSelectedInspector(e.target.value)}
              className="w-full md:w-64"
            >
              {inspectors.map((inspector) => (
                <option key={inspector.id} value={inspector.id}>
                  {inspector.name}
                </option>
              ))}
            </Select>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {currentDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center font-semibold text-sm bg-gray-100"
                >
                  {day}
                </div>
              ))}
              {days}
            </div>

            {/* Legend */}
            <div className="flex gap-6 mt-6 pt-6 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded" />
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded" />
                <span className="text-sm">Unavailable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-purple-500 rounded" />
                <span className="text-sm">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal for marking unavailability */}
        {showModal && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold mb-4">
                Mark Unavailability
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Annual leave, Training, Sick leave"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setReason('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveAvailability}>Save</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
