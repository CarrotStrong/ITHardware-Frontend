import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PublicPage from './pages/PublicPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import InventoryPage from './pages/admin/InventoryPage';
import AddEquipmentPage from './pages/admin/AddEquipmentPage';
import ReservationsPage from './pages/admin/ReservationsPage';

const setupDemoAccount = () => {
  const demoUser = {
    id: 'demo-123',
    name: 'Demo Account',
    email: 'demo@example.com',
    role: 'admin', 
  };
  localStorage.setItem('user', JSON.stringify(demoUser));
  localStorage.setItem('token', 'demo-token-bypass'); 
};

setupDemoAccount();

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--theme-card)',
              color: 'var(--theme-text)',
              border: '1px solid var(--theme-border)',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '600',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: 'white' }
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: 'white' }
            },
          }}
        />
        
        <Routes>
          <Route path="/" element={<PublicPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="add" element={<AddEquipmentPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}