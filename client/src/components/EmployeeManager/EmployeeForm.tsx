import React, { useState, useEffect } from 'react';
import { CloseIcon } from './Icons';
import type { Employee } from '../../types/Employee';

interface EmployeeFormProps {
  editingEmployee: Employee | null;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  role: 'manager' | 'cashier' | 'cook';
  setRole: (value: 'manager' | 'cashier' | 'cook') => void;
  onSave: () => void;
  onClose: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  editingEmployee,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phoneNumber,
  setPhoneNumber,
  role,
  setRole,
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

  const isFormValid = 
    firstName.trim() !== '' && 
    lastName.trim() !== '' &&
    email.trim() !== '' &&
    phoneNumber.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
          <div className="form-row">
            <div className="form-group">
              <label>First Name:</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                maxLength={50}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name:</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                maxLength={50}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@example.com"
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(123) 456-7890"
              maxLength={15}
              required
            />
          </div>

          <div className="form-group">
            <label>Role:</label>
            <select value={role} onChange={(e) => setRole(e.target.value as 'manager' | 'cashier' | 'cook')}>
              <option value="cashier">Cashier</option>
              <option value="cook">Cook</option>
              <option value="manager">Manager</option>
            </select>
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
