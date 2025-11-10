import React, { useState } from 'react';
import { 
  Sidebar, 
  NotificationBell, 
  MenuTab, 
  UtilitiesTab, 
  InventoryTab,
  IngredientsTab,
  EmployeeManagementTab
} from '../components/EmployeeManager';
import './Employee_Manager.css';

const Employee_Manager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'menu' | 'utilities' | 'inventory' | 'ingredients' | 'employees'>('menu');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTabChange = (newTab: 'menu' | 'utilities' | 'inventory' | 'ingredients' | 'employees') => {
    if (newTab !== activeTab) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveTab(newTab);
        setIsAnimating(false);
      }, 300); // Match the CSS animation duration
    }
  };

  return (
    <div className="employee-manager-container">
      {/* Notification Bell */}
      <NotificationBell />

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Content */}
      <main className={`main-content ${isAnimating ? 'tab-exit' : 'tab-enter'}`}>
        {activeTab === 'menu' && <MenuTab />}
        {activeTab === 'utilities' && <UtilitiesTab />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'ingredients' && <IngredientsTab />}
        {activeTab === 'employees' && <EmployeeManagementTab />}
      </main>
    </div>
  );
};

export default Employee_Manager;
