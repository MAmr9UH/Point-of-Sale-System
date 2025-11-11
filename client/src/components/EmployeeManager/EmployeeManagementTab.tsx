import React, { useState, useEffect } from 'react';
import { EmployeeForm } from './EmployeeForm.tsx';
import { EmployeeList } from './EmployeeList.tsx';
import { ShiftAssignment } from './ShiftAssignment.tsx';
import { ConfirmDialog } from './ConfirmDialog.tsx';
import { PlusIcon } from './Icons';
import { useToaster } from '../../contexts/ToastContext';
import type { Employee } from '../../types/Employee';

interface Customer {
  CustomerID: number;
  Fname: string | null;
  Lname: string | null;
  Email: string;
  PhoneNumber: string | null;
}

export const EmployeeManagementTab: React.FC = () => {
  const { addToast } = useToaster();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Form state
  const [payRate, setPayRate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

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
      addToast('Failed to load employees. Please try again.', 'error', 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee =>
    `${employee.Fname} ${employee.Lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.Role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openForm = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setPayRate(employee.PayRate?.toString() || '');
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setPayRate('');
    setSelectedCustomer(null);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        PayRate: parseFloat(payRate),
      };

      // Only include customerId when adding a new employee
      if (!editingEmployee && selectedCustomer) {
        payload.customerId = selectedCustomer.CustomerID;
      }

      const method = editingEmployee ? 'PUT' : 'POST';
      const url = editingEmployee 
        ? `/api/employees/${editingEmployee.StaffID}` 
        : '/api/employees';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to save employee');
      }

      addToast(
        editingEmployee ? 'Employee updated successfully!' : 'Employee created successfully!',
        'success',
        3000
      );
      closeForm();
      await loadEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      addToast(
        error instanceof Error ? error.message : 'Failed to save employee. Please try again.',
        'error',
        5000
      );
    }
  };

  const handleDelete = async (id: number) => {
    const employeeToDelete = employees.find(emp => emp.StaffID === id);
    const employeeName = employeeToDelete 
      ? `${employeeToDelete.Fname} ${employeeToDelete.Lname}`
      : 'this employee';

    setConfirmDialog({
      show: true,
      title: 'Delete Employee',
      message: `Are you sure you want to delete ${employeeName}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/employees/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to delete employee');
          }

          addToast('Employee deleted successfully!', 'success', 3000);
          await loadEmployees();
        } catch (error) {
          console.error('Error deleting employee:', error);
          addToast(
            error instanceof Error ? error.message : 'Failed to delete employee. Please try again.',
            'error',
            5000
          );
        } finally {
          setConfirmDialog(null);
        }
      },
    });
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
          payRate={payRate}
          setPayRate={setPayRate}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
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

      {confirmDialog?.show && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
        />
      )}
    </div>
  );
};
