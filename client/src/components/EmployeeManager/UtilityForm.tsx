import React, { useState, useEffect } from 'react';

interface Location {
  Name: number;
}

interface UtilityFormProps {
  utilityType: string;
  setUtilityType: (value: string) => void;
  utilityLocation: string;
  setUtilityLocation: (value: string) => void;
  totalAmount: string;
  setTotalAmount: (value: string) => void;
  utilityDate: string;
  setUtilityDate: (value: string) => void;
  onSave: () => void;
}

export const UtilityForm: React.FC<UtilityFormProps> = ({
  utilityType,
  setUtilityType,
  utilityLocation,
  setUtilityLocation,
  totalAmount,
  setTotalAmount,
  utilityDate,
  setUtilityDate,
  onSave
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setIsLoadingLocations(true);
    try {
      const response = await fetch('/api/utilities/locations');
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  return (
    <>
      <h2>Add Utility Payment</h2>

      <div className="form-group">
        <label>Type:</label>
        <select value={utilityType} onChange={e => setUtilityType(e.target.value)}>
          <option value="">Select Type</option>
          <option value="water">Water</option>
          <option value="electricity">Electricity</option>
          <option value="gas">Gas</option>
          <option value="internet">Internet</option>
          <option value="phone">Phone</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Location:</label>
        <select 
          value={utilityLocation} 
          onChange={e => setUtilityLocation(e.target.value)}
          disabled={isLoadingLocations}
        >
          <option value="">{isLoadingLocations ? 'Loading locations...' : 'Select Location'}</option>
          {locations.map((location) => (
            <option key={location.Name} value={location.Name}>
              {location.Name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Total Amount:</label>
        <input
          type="number"
          value={totalAmount}
          onChange={e => setTotalAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <div className="form-group">
        <label>Date:</label>
        <input
          type="date"
          value={utilityDate}
          onChange={e => setUtilityDate(e.target.value)}
        />
      </div>

      <button className="btn-primary" onClick={onSave}>
        Save Utility Payment
      </button>
    </>
  );
};
