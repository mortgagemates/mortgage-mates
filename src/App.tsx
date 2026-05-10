import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { seedDemoData } from './utils/storage';

// Pages
import Landing from './pages/Landing';
import BrokerLogin from './pages/broker/BrokerLogin';
import BrokerSignup from './pages/broker/BrokerSignup';
import BrokerDashboard from './pages/broker/BrokerDashboard';
import ApplicationsList from './pages/broker/ApplicationsList';
import NewApplication from './pages/broker/NewApplication';
import ApplicationDetail from './pages/broker/ApplicationDetail';
import ClientView from './pages/client/ClientView';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBrokers from './pages/admin/AdminBrokers';
import BrokerDetail from './pages/admin/BrokerDetail';

function RequireBroker({ children }: { children: React.ReactNode }) {
  const { currentBroker } = useApp();
  const location = useLocation();
  if (!currentBroker) return <Navigate to="/broker/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdminAuthed } = useApp();
  if (!isAdminAuthed) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  useEffect(() => { seedDemoData(); }, []);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/broker/login" element={<BrokerLogin />} />
      <Route path="/broker/signup" element={<BrokerSignup />} />

      {/* Client (public, no auth) */}
      <Route path="/client/:applicationId" element={<ClientView />} />

      {/* Broker (protected) */}
      <Route path="/broker/dashboard" element={<RequireBroker><BrokerDashboard /></RequireBroker>} />
      <Route path="/broker/applications" element={<RequireBroker><ApplicationsList /></RequireBroker>} />
      <Route path="/broker/applications/new" element={<RequireBroker><NewApplication /></RequireBroker>} />
      <Route path="/broker/applications/:id" element={<RequireBroker><ApplicationDetail /></RequireBroker>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      <Route path="/admin/brokers" element={<RequireAdmin><AdminBrokers /></RequireAdmin>} />
      <Route path="/admin/brokers/:brokerId" element={<RequireAdmin><BrokerDetail /></RequireAdmin>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
