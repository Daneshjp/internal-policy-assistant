import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useAuth } from './AuthContext';
import { tourSteps } from '@/config/tourSteps';

interface TourContextType {
  startTour: () => void;
  skipTour: () => void;
  resetTour: () => void;
  isTourActive: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);

  // Check if user has seen the tour before
  const getTourKey = () => user?.email ? `tour_completed_${user.email}` : null;

  useEffect(() => {
    if (user?.role) {
      setSteps(tourSteps[user.role] || []);

      // DISABLED: Auto-start tour for first-time users
      // The tour can be manually started from the Help menu
      // const tourKey = getTourKey();
      // if (tourKey) {
      //   const hasSeenTour = localStorage.getItem(tourKey);
      //   if (!hasSeenTour) {
      //     // Small delay to ensure UI is rendered
      //     setTimeout(() => setRunTour(true), 1000);
      //   }
      // }
    }
  }, [user]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      setStepIndex(0);

      // Mark tour as completed
      const tourKey = getTourKey();
      if (tourKey) {
        localStorage.setItem(tourKey, 'true');
      }
    } else if (type === 'step:after') {
      setStepIndex(index + 1);
    }
  };

  const startTour = () => {
    setStepIndex(0);
    setRunTour(true);
  };

  const skipTour = () => {
    setRunTour(false);
    const tourKey = getTourKey();
    if (tourKey) {
      localStorage.setItem(tourKey, 'true');
    }
  };

  const resetTour = () => {
    const tourKey = getTourKey();
    if (tourKey) {
      localStorage.removeItem(tourKey);
    }
    setStepIndex(0);
    setRunTour(false);
  };

  return (
    <TourContext.Provider
      value={{
        startTour,
        skipTour,
        resetTour,
        isTourActive: runTour,
      }}
    >
      {children}
      <Joyride
        steps={steps}
        run={runTour}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#047857',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: '8px',
          },
          buttonNext: {
            backgroundColor: '#047857',
            borderRadius: '6px',
            padding: '8px 16px',
          },
          buttonBack: {
            color: '#047857',
            marginRight: '8px',
          },
          buttonSkip: {
            color: '#6b7280',
          },
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
