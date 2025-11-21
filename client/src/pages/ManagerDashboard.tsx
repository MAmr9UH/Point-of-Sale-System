import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './ManagerDashboard.css';
import { TopNav } from '../components/TopNav';

export default function ManagerDashboard() {
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Trigger animations after mount
        requestAnimationFrame(() => {
            setIsLoaded(true);
        });
    }, []);

    const dashboardCards = [
        {
            title: 'Resource Management',
            description: 'Manage menu items, utilities, and inventory orders',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
            ),
            path: '/employee_manager',
            color: '#3b82f6',
        },
        {
            title: 'POS Menu',
            description: 'Open the point-of-sale menu interface for direct order taking',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 2H7c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 4H7V4h10v2zm3 16H4c-1.1 0-2-.9-2-2v-1h20v1c0 1.1-.9 2-2 2zm-1.47-11.81A2.008 2.008 0 0016.7 9H7.3c-.79 0-1.51.47-1.83 1.19L2 18h20l-3.47-7.81zM9.5 16h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1c.28 0 .5.22.5.5s-.22.5-.5.5zm0-2h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1c.28 0 .5.22.5.5s-.22.5-.5.5zm0-2h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1c.28 0 .5.22.5.5s-.22.5-.5.5zm6.5 4h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1c.28 0 .5.22.5.5s-.22.5-.5.5zm0-2h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1c.28 0 .5.22.5.5s-.22.5-.5.5zm0-2h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1c.28 0 .5.22.5.5s-.22.5-.5.5z" />
                </svg>
            ),
            path: '/posmenu',
            color: '#22c55e',
        },
        {
            title: 'Customer Menu',
            description: 'View the menu as customers see it',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 000 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
                </svg>
            ),
            path: '/menu',
            color: '#f59e0b',
        },
        {
            title: 'Edit Landing Page',
            description: 'Change image, food truck name, description, etc',
            icon: (
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M11.32 6.176H5c-1.105 0-2 .949-2 2.118v10.588C3 20.052 3.895 21 5 21h11c1.105 0 2-.948 2-2.118v-7.75l-3.914 4.144A2.46 2.46 0 0 1 12.81 16l-2.681.568c-1.75.37-3.292-1.263-2.942-3.115l.536-2.839c.097-.512.335-.983.684-1.352l2.914-3.086Z" clip-rule="evenodd" />
                    <path fill-rule="evenodd" d="M19.846 4.318a2.148 2.148 0 0 0-.437-.692 2.014 2.014 0 0 0-.654-.463 1.92 1.92 0 0 0-1.544 0 2.014 2.014 0 0 0-.654.463l-.546.578 2.852 3.02.546-.579a2.14 2.14 0 0 0 .437-.692 2.244 2.244 0 0 0 0-1.635ZM17.45 8.721 14.597 5.7 9.82 10.76a.54.54 0 0 0-.137.27l-.536 2.84c-.07.37.239.696.588.622l2.682-.567a.492.492 0 0 0 .255-.145l4.778-5.06Z" clip-rule="evenodd" />
                </svg>

            ),
            path: '/edit-landing',
            color: '#8b5cf6',
        },
        {
            title: 'Reports',
            description: 'View sales reports and analytics',
            icon: (
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Zm2 8v-2h7v2H4Zm0 2v2h7v-2H4Zm9 2h7v-2h-7v2Zm7-4v-2h-7v2h7Z" clip-rule="evenodd" />
                </svg>

            ),
            path: '/reports',
            color: '#ef4444',
        },
        {
            title: 'Welcome Page',
            description: 'Return to home screen',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
            ),
            path: '/',
            color: '#06b6d4',
        },
    ];

    return (
        <div className={`manager-dashboard-container ${isLoaded ? 'loaded' : ''}`}>
            <TopNav />

            <div className="manager-dashboard-content">
                <header className="manager-dashboard-header">
                    <h1 className="manager-dashboard-title">
                        <span className="gradient-text">Manager Dashboard</span>
                    </h1>
                    <p className="manager-dashboard-subtitle">
                        <span className="subtitle-icon">🎯</span>
                        Central hub for managing your food truck operations
                    </p>
                </header>

                <div className="manager-dashboard-grid">
                    {dashboardCards.map((card, index) => (
                        <div
                            key={card.path}
                            className="manager-dashboard-card"
                            onClick={() => navigate(card.path)}
                            style={{ 
                                '--card-color': card.color,
                                '--card-index': index
                            } as React.CSSProperties}
                        >
                            <div className="manager-card-icon" style={{ color: card.color }}>
                                {card.icon}
                            </div>
                            <h2 className="manager-card-title">{card.title}</h2>
                            <p className="manager-card-description">{card.description}</p>
                            <div className="manager-card-arrow">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="employee-access-section">
                    <button 
                        className="employee-access-btn"
                        onClick={() => navigate('/employee')}
                    >
                        <span className="employee-icon">👤</span>
                        <span>Employee Dashboard Access</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                        </svg>
                    </button>
                </div>
            </div>

            <footer className="manager-dashboard-footer">
                © {new Date().getFullYear()} Food Truck POS • Manager Access Only
            </footer>
        </div>
    );
}
