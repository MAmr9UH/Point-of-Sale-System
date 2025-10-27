import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ShoppingCartProvider } from './contexts/ShoppingCart'
import { ToasterProvider } from './contexts/ToastContext.tsx'
import { WelcomePageProvider } from './contexts/WelcomePageContext.tsx'
import Menu from './pages/Menu';
import WelcomePage from './pages/WelcomePageDD'
import Login from './pages/LoginPage.tsx';
import Employee_Manager from './pages/Employee_Manager.tsx';
import Checkout from './pages/Checkout.tsx';
import MenuUserPage from './pages/MenuUserPage.tsx';
import ManagerDashboard from './pages/ManagerDashboard.tsx';
import EditLandingPage from './pages/EditLandingPage.tsx';
import ReportsPage from "./pages/ReportsPage.tsx"

function App() {

  return (
    <>
      <ToasterProvider>
        <ShoppingCartProvider>
          <WelcomePageProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/manager" element={<ManagerDashboard />} />
                <Route path="/edit-landing" element={<EditLandingPage />} />
                <Route path="/posmenu" element={<Menu />} />
                <Route path="/menu" element={<MenuUserPage />} />
                <Route path="/employee_manager" element={<Employee_Manager />} />
                <Route path="/checkout" element={<Checkout />} />

                <Route path="/reports" element={<ReportsPage />} />
              </Routes>
            </BrowserRouter>
          </WelcomePageProvider>
        </ShoppingCartProvider>
      </ToasterProvider>
    </>
  )
}

export default App
