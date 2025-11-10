import React, { useState, useEffect } from 'react';
import { UtilityForm } from './UtilityForm';
import { UtilityList } from './UtilityList';


export const UtilitiesTab: React.FC = () => {
  const [utilityType, setUtilityType] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [utilityDate, setUtilityDate] = useState('');
  const [utilityLocation, setUtilityLocation] = useState('');
  const [utilitiesList, setUtilitiesList] = useState<any[]>([]);

  useEffect(() => {
    loadUtilities();
  }, []);

  const loadUtilities = async () => {
    try {
      const response = await fetch('/api/utilities');
      const data = await response.json();
      setUtilitiesList(data);
    } catch (error) {
      console.error('Error loading utilities:', error);
    }
  };

  const handleSaveUtilityPayment = async () => {
    try {
      const payload = {
        type: utilityType,
        totalAmount: parseFloat(totalAmount),
        date: utilityDate,
        locationName: utilityLocation,
      };

      const res = await fetch('/api/utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      console.log('✅ Utility payment saved:', data);
      alert('Utility payment saved successfully!');

      setUtilityType('');
      setTotalAmount('');
      setUtilityDate('');
      setUtilityLocation('');

      await loadUtilities();
    } catch (err) {
      console.error('❌ Error saving utility payment:', err);
      alert('Failed to save utility payment. Check console.');
    }
  };

  return (
    <div className="form-container">
      <div className="page-header">
        <h1 className="page-title">Utilities Management</h1>
        <p className="page-subtitle">Track and manage utility payments across locations</p>
      </div>

      <div className="content-card">
        <UtilityForm
          utilityType={utilityType}
          setUtilityType={setUtilityType}
          utilityLocation={utilityLocation}
          setUtilityLocation={setUtilityLocation}
          totalAmount={totalAmount}
          setTotalAmount={setTotalAmount}
          utilityDate={utilityDate}
          setUtilityDate={setUtilityDate}
          onSave={handleSaveUtilityPayment}
        />

        <UtilityList utilities={utilitiesList} />
      </div>
    </div>
  );
};
