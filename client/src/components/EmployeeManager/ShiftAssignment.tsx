import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../../utils/jwtAuth';
import { CloseIcon } from './Icons';
import type { Employee, Shift } from '../../types/Employee';
import { useWelcomePage } from '../../contexts/WelcomePageContext';
import { useToaster } from '../../contexts/ToastContext';
import { ConfirmDialog } from './ConfirmDialog';

interface ShiftAssignmentProps {
  employee: Employee;
  onClose: () => void;
}

export const ShiftAssignment: React.FC<ShiftAssignmentProps> = ({ employee, onClose }) => {
  const { pageData } = useWelcomePage();
  const { addToast } = useToaster();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [locationId, setLocationId] = useState('');

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
    loadShifts();
  }, []);

  const loadShifts = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(`/api/shifts/staff/${employee.StaffID}`);
      const data = await response.json();
      setShifts(data);
    } catch (error) {
      console.error('Error loading shifts:', error);
      addToast('Failed to load shifts. Please try again.', 'error', 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleAddShift = async () => {
    if (!dayOfWeek || !startTime || !endTime || !locationId) {
      addToast('Please fill in all shift details', 'error', 3000);
      return;
    }

    try {
      // Get the next occurrence of the selected day of week
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = new Date();
      const currentDay = today.getDay();
      const targetDay = daysOfWeek.indexOf(dayOfWeek.toLowerCase());
      
      let daysUntilTarget = targetDay - currentDay;
      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7; // Next week if day has passed this week
      }
      
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysUntilTarget);
      const dateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

      // Format as SQL DATETIME: YYYY-MM-DD HH:MM:SS
      const scheduleStart = `${dateString} ${startTime}:00`;
      const scheduleEnd = `${dateString} ${endTime}:00`;

      const payload = {
        staffId: employee.StaffID,
        activeLocationId: parseInt(locationId),
        scheduleStart: scheduleStart,
        scheduleEnd: scheduleEnd,
      };

      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add shift');
      }

      addToast('Shift added successfully!', 'success', 3000);
      setDayOfWeek('');
      setStartTime('');
      setEndTime('');
      setLocationId('');
      await loadShifts();
    } catch (error) {
      console.error('Error adding shift:', error);
      addToast(
        error instanceof Error ? error.message : 'Failed to add shift. Please try again.',
        'error',
        5000
      );
    }
  };

  const handleDeleteShift = async (assignId: number, shift: Shift) => {
    const shiftDate = formatDateTime(shift.scheduleStart);
    const shiftTime = `${formatTime(shift.scheduleStart)} - ${formatTime(shift.scheduleEnd)}`;
    
    setConfirmDialog({
      show: true,
      title: 'Delete Shift',
      message: `Are you sure you want to delete the shift on ${shiftDate} (${shiftTime})? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const response = await authenticatedFetch(`/api/shifts/${assignId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to delete shift');
          }

          addToast('Shift deleted successfully!', 'success', 3000);
          await loadShifts();
        } catch (error) {
          console.error('Error deleting shift:', error);
          addToast(
            error instanceof Error ? error.message : 'Failed to delete shift. Please try again.',
            'error',
            5000
          );
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    return dayOfWeek;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHour}:${displayMinutes} ${ampm}`;
  };

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
        className="modal-content modal-large"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: isVisible && !isClosing ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isVisible && !isClosing ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          maxWidth: '800px',
        }}
      >
        <div className="modal-header">
          <h2>Shift Assignment - {employee.Fname} {employee.Lname}</h2>
          <button className="modal-close" onClick={handleClose}>
            <CloseIcon style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        <div className="modal-body">
          {/* Add Shift Form */}
          <div className="shift-form-section">
            <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Add New Shift</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Day of Week:</label>
                <select 
                  value={dayOfWeek} 
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  style={{ textTransform: 'capitalize' }}
                >
                  <option value="">Select day</option>
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Time:</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Time:</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Location:</label>
              <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                <option value="">Select location</option>
                {pageData?.ActiveLocations?.map((loc) => (
                  <option key={loc.ActiveLocationID} value={loc.ActiveLocationID}>
                    {loc.LocationName}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn-primary"
              onClick={handleAddShift}
              style={{ marginTop: '1rem' }}
            >
              Add Shift
            </button>
          </div>

          <hr style={{ margin: '2rem 0', border: 'none', borderTop: '2px solid #ecf0f1' }} />

          {/* Shifts List */}
          <div className="shifts-list-section">
            <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Assigned Shifts</h3>
            {isLoading ? (
              <p>Loading shifts...</p>
            ) : shifts.length === 0 ? (
              <p className="empty-state">No shifts assigned yet.</p>
            ) : (
              <div className="shifts-list">
                {shifts.map((shift) => (
                  <div key={shift.assignId} className="shift-card">
                    <div className="shift-info">
                      <div className="shift-date">
                        📅 {formatDateTime(shift.scheduleStart)}
                      </div>
                      <div className="shift-time">
                        🕐 {formatTime(shift.scheduleStart)} - {formatTime(shift.scheduleEnd)}
                      </div>
                      <div className="shift-location">
                        📍 {shift.locationName || `Location ${shift.activeLocationId}`}
                      </div>
                    </div>
                    <button
                      className="btn-delete-shift"
                      onClick={() => shift.assignId && handleDeleteShift(shift.assignId, shift)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
    </div>
  );
};
