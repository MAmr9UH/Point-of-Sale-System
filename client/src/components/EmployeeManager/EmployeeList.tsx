import React from 'react';
import type { Employee } from '../../types/Employee';

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
  onAssignShift: (employee: Employee) => void;
  searchTerm?: string;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onEdit,
  onDelete,
  onAssignShift,
  searchTerm = '',
}) => {
  if (employees.length === 0) {
    return (
      <div className="empty-state">
        {searchTerm ? (
          <p>No employees found matching "{searchTerm}". Try a different search term.</p>
        ) : (
          <p>No employees added yet. Click the + button to add one!</p>
        )}
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'manager':
        return 'role-badge-manager';
      case 'cook':
        return 'role-badge-cook';
      case 'cashier':
        return 'role-badge-cashier';
      default:
        return 'role-badge-default';
    }
  };

  return (
    <div className="employees-grid">
      {employees.map((employee) => (
        <div key={employee.StaffID} className="employee-card">
          <div className="employee-header">
            <div>
              <h3 className="employee-name">
                {employee.Fname} {employee.Lname}
              </h3>
              <span className={`role-badge ${getRoleBadgeClass(employee.Role)}`}>
                {employee.Role.charAt(0).toUpperCase() + employee.Role.slice(1)}
              </span>
            </div>
          </div>

          <div className="employee-details">
            <div className="employee-detail">
              <span className="detail-label">📧 Email:</span>
              <span className="detail-value">{employee.Email}</span>
            </div>

            <div className="employee-detail">
              <span className="detail-label">📞 Phone:</span>
              <span className="detail-value">{employee.PhoneNumber}</span>
            </div>

            {employee.HireDate && (
              <div className="employee-detail">
                <span className="detail-label">📅 Hire Date:</span>
                <span className="detail-value">{formatDate(employee.HireDate)}</span>
              </div>
            )}
          </div>

          <div className="employee-actions">
            <button
              className="btn-shift"
              onClick={() => onAssignShift(employee)}
              title="Assign shifts"
            >
              📅 Shifts
            </button>
            <button
              className="btn-edit"
              onClick={() => onEdit(employee)}
              title="Edit"
            >
              Edit
            </button>
            <button
              className="btn-delete"
              onClick={() => employee.StaffID && onDelete(employee.StaffID)}
              title="Delete employee"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
