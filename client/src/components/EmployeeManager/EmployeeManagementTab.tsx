import React, { useState, useEffect } from 'react';
import { EmployeeForm } from './EmployeeForm.tsx';
import { EmployeeList } from './EmployeeList.tsx';
import { ShiftAssignment } from './ShiftAssignment.tsx';
import { PlusIcon } from './Icons';
import type { Employee } from '../../types/Employee';

export const EmployeeManagementTab: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'manager' | 'cashier' | 'cook'>('cashier');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee =>
    `${employee.FirstName} ${employee.LastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.Role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openForm = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFirstName(employee.FirstName);
      setLastName(employee.LastName);
      setEmail(employee.Email);
      setPhoneNumber(employee.PhoneNumber);
      setRole(employee.Role);
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setRole('cashier');
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSave = async () => {
    try {
      const payload: Partial<Employee> = {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        PhoneNumber: phoneNumber,
        Role: role,
      };

      const method = editingEmployee ? 'PUT' : 'POST';
      const url = editingEmployee 
        ? `/api/employees/${editingEmployee.StaffID}` 
        : '/api/employees';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save employee');

      alert(editingEmployee ? 'Employee updated!' : 'Employee created!');
      closeForm();
      await loadEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete employee');

      alert('Employee deleted!');
      await loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    }
  };

  const openShiftAssignment = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowShiftForm(true);
  };

  const closeShiftForm = () => {
    setShowShiftForm(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="form-container">
      <div className="page-header">
        <h1 className="page-title">Employee Management</h1>
        <p className="page-subtitle">Manage employees and assign shifts</p>
      </div>

      <div className="search-container">
        <div className="glass-search-wrapper">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            className="glass-search-input"
            placeholder="Search employees by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <div className="search-results-count">
            Found {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-message">Loading employees...</div>
      ) : (
        <EmployeeList
          employees={filteredEmployees}
          onEdit={openForm}
          onDelete={handleDelete}
          onAssignShift={openShiftAssignment}
          searchTerm={searchTerm}
        />
      )}

      <button className="add-menu-item-btn" onClick={() => openForm()}>
        <PlusIcon style={{ width: '24px', height: '24px' }} />
      </button>

      {showForm && (
        <EmployeeForm
          editingEmployee={editingEmployee}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          email={email}
          setEmail={setEmail}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          role={role}
          setRole={setRole}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      {showShiftForm && selectedEmployee && (
        <ShiftAssignment
          employee={selectedEmployee}
          onClose={closeShiftForm}
        />
      )}
    </div>
  );
};
