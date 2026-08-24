import { Navigate, BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthPage } from '@/pages/AuthPage';
import { CitizenLayout } from '@/layouts/CitizenLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AlertBanner } from '@/components/AlertBanner';
import { useActiveAlerts } from '@/hooks/useActiveAlerts';
import { CitizenEventsPage } from '@/pages/citizen/CitizenEventsPage';
import { MyTicketsPage } from '@/pages/citizen/MyTicketsPage';
import { ResourcesPage } from '@/pages/shared/ResourcesPage';
import { ContactsPage } from '@/pages/shared/ContactsPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminEventsPage } from '@/pages/admin/AdminEventsPage';
import { AdminAlertsPage } from '@/pages/admin/AdminAlertsPage';
import { AdminResourcesPage } from '@/pages/admin/AdminResourcesPage';
import { AdminContactsPage } from '@/pages/admin/AdminContactsPage';
import { Loader2 } from 'lucide-react';

function AppRoutes() {
  const { user, profile, loading } = useAuth();
  const alerts = useActiveAlerts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <Loader2 className="w-8 h-8 text-navy-400 animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthPage />;
  }

  // Wrap authenticated views with alert banner
  const withAlertBanner = (element: React.ReactNode) => (
    <div>
      <AlertBanner alerts={alerts} />
      {element}
    </div>
  );

  if (profile.role === 'admin') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={withAlertBanner(<AdminLayout />)}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="alerts" element={<AdminAlertsPage />} />
            <Route path="resources" element={<AdminResourcesPage />} />
            <Route path="contacts" element={<AdminContactsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={withAlertBanner(<CitizenLayout />)}>
          <Route path="events" element={<CitizenEventsPage />} />
          <Route path="my-tickets" element={<MyTicketsPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="contacts" element={<ContactsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/app/events" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
