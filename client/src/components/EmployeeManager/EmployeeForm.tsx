import React, { useState, useEffect } from 'react';
import { CloseIcon } from './Icons';
import { CustomerSearch } from './CustomerSearch';
import type { Employee } from '../../types/Employee';

interface Customer {
  CustomerID: number;
  Fname: string | null;
  Lname: string | null;
  Email: string;
  PhoneNumber: string | null;
}

interface EmployeeFormProps {
  editingEmployee: Employee | null;
  payRate: string;
  setPayRate: (value: string) => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  onSave: () => void;
  onClose: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  editingEmployee,
  payRate,
  setPayRate,
  selectedCustomer,
  setSelectedCustomer,
  onSave,
  onClose,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const isFormValid = editingEmployee 
    ? (payRate.trim() !== '' && !isNaN(parseFloat(payRate)) && parseFloat(payRate) > 0)
    : (selectedCustomer !== null && payRate.trim() !== '' && !isNaN(parseFloat(payRate)) && parseFloat(payRate) > 0);

  return (
    <div
      className="modal-overlay"
      onClick={handleClose}
      style={{
        opacity: isVisible && !isClosing ? 1 : 0,
        transition: 'opacity 0.3s ease-out',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: isVisible && !isClosing ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isVisible && !isClosing ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div className="modal-header">
          <h2>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
          <button className="modal-close" onClick={handleClose}>
            <CloseIcon style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        <div className="modal-body">
          {!editingEmployee && (
            <div className="form-group">
              <label>Select Customer: <span style={{ color: '#ef4444' }}>*</span></label>
              <CustomerSearch 
                onSelect={setSelectedCustomer}
                selectedCustomer={selectedCustomer}
              />
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
                Search for an existing customer by name, email, or phone number to create their employee account.
              </p>
            </div>
          )}

          <div className="form-group">
            <label>Pay Rate ($/hour):</label>
            <input
              type="number"
              value={payRate}
              onChange={(e) => setPayRate(e.target.value)}
              placeholder="Enter hourly pay rate"
              min="0"
              step="0.01"
              required
            />
          </div>

          <button
            className="btn-primary"
            onClick={onSave}
            disabled={!isFormValid}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {editingEmployee ? 'Update Employee' : 'Add Employee'}
          </button>
        </div>
      </div>
    </div>
  );
};
