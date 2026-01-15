import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { TourProvider } from '@/context/TourContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MainLayout } from '@/components/Layout/MainLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ProfilePage from '@/pages/auth/ProfilePage';

// Dashboard
import DashboardPage from '@/pages/dashboard/DashboardPage';

// Asset Pages
import AssetListPage from '@/pages/assets/AssetListPage';
import AssetDetailPage from '@/pages/assets/AssetDetailPage';
import AssetFormPage from '@/pages/assets/AssetFormPage';

// Planning Pages
import { AnnualPlanPage } from '@/pages/planning/AnnualPlanPage';
import { AnnualPlanWizard } from '@/pages/planning/AnnualPlanWizard';
import { AnnualPlanDetailPage } from '@/pages/planning/AnnualPlanDetailPage';
import { PlannedInspectionsPage } from '@/pages/planning/PlannedInspectionsPage';

// Team Pages
import { TeamsPage } from '@/pages/teams/TeamsPage';
import { TeamDetailPage } from '@/pages/teams/TeamDetailPage';
import { AssignmentBoard } from '@/pages/teams/AssignmentBoard';
import { AvailabilityCalendar } from '@/pages/teams/AvailabilityCalendar';

// Other Module Pages
import InspectionsPage from '@/pages/inspections/InspectionsPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import ApprovalsPage from '@/pages/approvals/ApprovalsPage';
import WorkRequestsPage from '@/pages/work-requests/WorkRequestsPage';
import RBIPage from '@/pages/rbi/RBIPage';
import AnalyticsPage from '@/pages/analytics/AnalyticsPage';
import EscalationsPage from '@/pages/escalations/EscalationsPage';
import AdminPage from '@/pages/admin/AdminPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Root redirect component
function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <TourProvider>
            <BrowserRouter>
            <Routes>
              {/* Root - Redirect based on auth status */}
              <Route path="/" element={<RootRedirect />} />

              {/* Auth Routes - Module 1 */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DashboardPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ProfilePage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Asset Routes - Module 2 */}
              <Route
                path="/assets"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AssetListPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assets/new"
                element={
                  <ProtectedRoute allowedRoles={['team_leader', 'admin']}>
                    <MainLayout>
                      <AssetFormPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assets/:id"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AssetDetailPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assets/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['team_leader', 'admin']}>
                    <MainLayout>
                      <AssetFormPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Planning Routes - Module 3 */}
              <Route
                path="/plans/annual"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AnnualPlanPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plans/annual/new"
                element={
                  <ProtectedRoute allowedRoles={['team_leader', 'admin']}>
                    <MainLayout>
                      <AnnualPlanWizard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plans/annual/:id"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AnnualPlanDetailPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plans/inspections"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PlannedInspectionsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Team Routes - Module 4 */}
              <Route
                path="/teams"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TeamsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teams/:id"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TeamDetailPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assignments"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AssignmentBoard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/availability"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AvailabilityCalendar />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Other Module Routes */}
              <Route
                path="/inspections"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <InspectionsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inspections/:id"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <InspectionsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ReportsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ApprovalsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/work-requests"
                element={
                  <ProtectedRoute allowedRoles={['engineer', 'team_leader', 'admin']}>
                    <MainLayout>
                      <WorkRequestsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rbi"
                element={
                  <ProtectedRoute allowedRoles={['rbi_auditor', 'admin']}>
                    <MainLayout>
                      <RBIPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={['team_leader', 'admin']}>
                    <MainLayout>
                      <AnalyticsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/escalations"
                element={
                  <ProtectedRoute allowedRoles={['team_leader', 'admin']}>
                    <MainLayout>
                      <EscalationsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <MainLayout>
                      <AdminPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to root */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </BrowserRouter>
          </TourProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
