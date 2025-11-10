import React from 'react';

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
        <input
          type="text"
          value={utilityLocation}
          onChange={e => setUtilityLocation(e.target.value)}
          placeholder="Enter location name"
        />
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
