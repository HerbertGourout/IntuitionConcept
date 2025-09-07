import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectProvider } from './contexts/ProjectContext';
import { PurchaseOrderProvider } from './contexts/PurchaseOrderContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { AuthProvider } from './contexts/AuthContext';

// Pages publiques
import UltraModernHomePage from './pages/UltraModernHomePage';
import Pricing from './pages/Pricing';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthTestPage from './components/Auth/AuthTestPage';
import Subscription from './pages/Subscription';

// Application principale (existante)
import App from './App';

const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <PaymentProvider>
        <Router>
          <Routes>
            {/* Pages publiques */}
            <Route path="/" element={<UltraModernHomePage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/auth-test" element={<AuthTestPage />} />
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Application principale */}
            <Route path="/app/*" element={
              <ProjectProvider>
                <PurchaseOrderProvider>
                  <App />
                </PurchaseOrderProvider>
              </ProjectProvider>
            } />
            
            {/* Redirections */}
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/projects" element={<Navigate to="/app/projects" replace />} />
            <Route path="/tasks" element={<Navigate to="/app/tasks" replace />} />
            <Route path="/finances" element={<Navigate to="/app/finances" replace />} />
            <Route path="/planning" element={<Navigate to="/app/planning" replace />} />
            <Route path="/documents" element={<Navigate to="/app/documents" replace />} />
            <Route path="/team" element={<Navigate to="/app/team" replace />} />
            <Route path="/equipment" element={<Navigate to="/app/equipment" replace />} />
            <Route path="/locations" element={<Navigate to="/app/locations" replace />} />
            <Route path="/purchase-orders" element={<Navigate to="/app/purchase-orders" replace />} />
            <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
            
            {/* Page 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Page non trouvée</p>
                  <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Retour à l'accueil
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </Router>
      </PaymentProvider>
    </AuthProvider>
  );
};

export default AppRouter;
