import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuIcon, UtilitiesIcon, InventoryIcon, IngredientsIcon, EmployeeIcon, HomeIcon } from './Icons';

interface SidebarProps {
  activeTab: 'menu' | 'utilities' | 'inventory' | 'ingredients' | 'employees';
  setActiveTab: (tab: 'menu' | 'utilities' | 'inventory' | 'ingredients' | 'employees') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Manager Portal</h1>
      </div>
      <nav className="sidebar-nav">
        <button
          className={`sidebar-button ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          <MenuIcon />
          <span>Menu Items</span>
        </button>
        <button
          className={`sidebar-button ${activeTab === 'utilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('utilities')}
        >
          <UtilitiesIcon />
          <span>Utilities</span>
        </button>
        <button
          className={`sidebar-button ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <InventoryIcon />
          <span>Inventory</span>
        </button>
        <button
          className={`sidebar-button ${activeTab === 'ingredients' ? 'active' : ''}`}
          onClick={() => setActiveTab('ingredients')}
        >
          <IngredientsIcon />
          <span>Ingredients</span>
        </button>
        <button
          className={`sidebar-button ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          <EmployeeIcon />
          <span>Employees</span>
        </button>
        <button
          className="sidebar-button home-button"
          onClick={() => navigate('/')}
        >
          <HomeIcon />
          <span>Home</span>
        </button>
      </nav>
    </aside>
  );
};
