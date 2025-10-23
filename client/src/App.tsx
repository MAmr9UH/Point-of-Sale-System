import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ShoppingCartProvider } from './contexts/ShoppingCart'
import { ToasterProvider } from './contexts/ToastContext.tsx'
import Menu from './pages/Menu';
import WelcomePage from './pages/WelcomePageDD' 
import Login from './pages/LoginPage.tsx';
import Employee_Manager from './pages/Employee_Manager.tsx';
import Checkout from './pages/Checkout.tsx';

function App() {
  
  return (
    <> 
      <ToasterProvider>
        <ShoppingCartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/employee_manager" element={<Employee_Manager />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </BrowserRouter>
        </ShoppingCartProvider>
      </ToasterProvider>
    </>
  )
}

export default App
