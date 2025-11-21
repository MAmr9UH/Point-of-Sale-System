import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TopNav } from '../components/TopNav';
import './EmployeeDashboard.css';

export const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Redirect if not staff
  React.useEffect(() => {
    if (userType !== 'employee' && userType !== 'manager') {
      navigate('/login');
    }
  }, [userType, navigate]);

  React.useEffect(() => {
    // Trigger animations after mount
    requestAnimationFrame(() => {
      setIsLoaded(true);
    });
  }, []);

  if (userType !== 'employee' && userType !== 'manager') {
    return null;
  }

  const dashboardCards = [
    {
      id: 'pos',
      title: 'POS - Take Orders',
      description: 'Access the point-of-sale system to take customer orders',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 2H7c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 4H7V4h10v2zm3 16H4c-1.1 0-2-.9-2-2v-1h20v1c0 1.1-.9 2-2 2zm-1.47-11.81A2.008 2.008 0 0016.7 9H7.3c-.79 0-1.51.47-1.83 1.19L2 18h20l-3.47-7.81zM9.5 16h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1c.28 0 .5.22.5.5s-.22.5-.5.5zm0-2h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1c.28 0 .5.22.5.5s-.22.5-.5.5zm0-2h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1c.28 0 .5.22.5.5s-.22.5-.5.5zm6.5 4h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1c.28 0 .5.22.5.5s-.22.5-.5.5zm0-2h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1c.28 0 .5.22.5.5s-.22.5-.5.5zm0-2h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1c.28 0 .5.22.5.5s-.22.5-.5.5z" />
        </svg>
      ),
      path: '/posmenu',
      color: '#22c55e',
    },
    {
      id: 'timecard',
      title: 'Time Clock',
      description: 'Clock in and out, track your work hours',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
        </svg>
      ),
      path: '/timecard',
      color: '#8b5cf6',
    },
    {
      id: 'shifts',
      title: 'My Shifts',
      description: 'View your assigned shifts and work schedule',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/>
        </svg>
      ),
      path: '/shifts',
      color: '#3b82f6'
    },
    {
      id: 'orders',
      title: 'View Orders',
      description: 'View and process customer orders',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
        </svg>
      ),
      path: '/orders',
      color: '#f59e0b'
    }
  ];

  return (
    <div className={`employee-dashboard-container ${isLoaded ? 'loaded' : ''}`}>
      <TopNav />

      <div className="employee-dashboard-content">
        <header className="employee-dashboard-header">
          <h1 className="employee-dashboard-title">
            <span className="gradient-text">Employee Dashboard</span>
          </h1>
          <p className="employee-dashboard-subtitle">
            {/* <span className="subtitle-icon">�</span> */}
            Welcome back, {(user as any)?.Fname || 'Employee'}! Ready to get started?
          </p>
        </header>

        <div className="employee-dashboard-grid">
          {dashboardCards.map((card, index) => (
            <div
              key={card.id}
              className="employee-dashboard-card"
              onClick={() => navigate(card.path)}
              style={{ 
                '--card-color': card.color,
                '--card-index': index
              } as React.CSSProperties}
            >
              <div className="employee-card-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              <h2 className="employee-card-title">{card.title}</h2>
              <p className="employee-card-description">{card.description}</p>
              <div className="employee-card-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {userType === 'manager' && (
          <div className="manager-access-section">
            <button 
              className="manager-access-btn"
              onClick={() => navigate('/manager')}
            >
              <span className="manager-icon">⚙️</span>
              <span>Manager Dashboard Access</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <footer className="employee-dashboard-footer">
        © {new Date().getFullYear()} Food Truck POS • Employee Access
      </footer>
    </div>
  );
};
