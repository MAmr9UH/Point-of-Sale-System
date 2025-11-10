import { Routes, Route, Navigate } from 'react-router-dom';
import Menu from './pages/Menu';
import WelcomePage from './pages/WelcomePageDD'
import Login from './pages/LoginPage.tsx';
import Employee_Manager from './pages/Employee_Manager.tsx';
import Checkout from './pages/Checkout.tsx';
import MenuUserPage from './pages/MenuUserPage.tsx';
import ManagerDashboard from './pages/ManagerDashboard.tsx';
import EditLandingPage from './pages/EditLandingPage.tsx';
import ReportsPage from "./pages/ReportsPage.tsx"
import LoadingSpinner from './components/LoadingSpinner.tsx';

import { useAuth } from './contexts/AuthContext.tsx';

const ProtectedRoute = ({ children }: any) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner message="Verifying authentication..." />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const ManagerProtectedRoute = ({ children }: any) => {
  const { user, userType, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Verifying credentials..." />;
  }

  if (!user || userType !== 'manager') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const LoginRoute = ( { registering = false } : { registering?: boolean } ) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <Login registering={registering} />;
};


function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/signup" element={<LoginRoute registering={true} />} />
      <Route path="/manager" element={
        <ManagerProtectedRoute><ManagerDashboard /></ManagerProtectedRoute>} />
      <Route path="/edit-landing" element={<ManagerProtectedRoute><EditLandingPage /></ManagerProtectedRoute>} />
      <Route path="/posmenu" element={<Menu />} />
      <Route path="/menu" element={<MenuUserPage />} />
      <Route path="/employee_manager" element={<ManagerProtectedRoute><Employee_Manager /></ManagerProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/reports" element={<ManagerProtectedRoute><ReportsPage /></ManagerProtectedRoute>} />
    </Routes>
  )
}

export default App
