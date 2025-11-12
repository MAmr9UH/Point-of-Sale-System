import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TopNav } from '../components/TopNav';
import LoadingSpinner from '../components/LoadingSpinner';
import './EmployeeShifts.css';

interface Shift {
  assignId: number;
  activeLocationId: number;
  staffId: number;
  scheduleStart: string;
  scheduleEnd: string;
  locationName: string;
  shiftId: number;
  createdAt: string;
  lastUpdatedAt: string;
}

export const EmployeeShifts: React.FC = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after mount
    requestAnimationFrame(() => {
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (userType !== 'employee' && userType !== 'manager') {
      navigate('/login');
      return;
    }

    const fetchShifts = async () => {
      try {
        setLoading(true);
        setError(null);
        const staffId = (user as any)?.StaffID;
        
        if (!staffId) {
          setError('Staff ID not found');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/shifts/staff/${staffId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch shifts');
        }

        const data = await response.json();
        setShifts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shifts');
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, [user, userType, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const isUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  const isPast = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isOngoing = (startDate: string, endDate: string) => {
    const now = new Date();
    return new Date(startDate) <= now && new Date(endDate) >= now;
  };

  const getShiftStatus = (start: string, end: string) => {
    if (isOngoing(start, end)) return 'ongoing';
    if (isUpcoming(start)) return 'upcoming';
    if (isPast(end)) return 'past';
    return 'past';
  };

  const upcomingShifts = shifts.filter(shift => getShiftStatus(shift.scheduleStart, shift.scheduleEnd) === 'upcoming');
  const ongoingShifts = shifts.filter(shift => getShiftStatus(shift.scheduleStart, shift.scheduleEnd) === 'ongoing');
  const pastShifts = shifts.filter(shift => getShiftStatus(shift.scheduleStart, shift.scheduleEnd) === 'past');

  if (loading) {
    return <LoadingSpinner message="Loading your shifts..." />;
  }

  return (
    <div className={`employee-shifts-container ${isLoaded ? 'loaded' : ''}`}>
      <TopNav />

      <div className="employee-shifts-content">
        <header className="employee-shifts-header">
          <button className="back-button" onClick={() => navigate('/employee')}>
            ← Back to Dashboard
          </button>
          <h1 className="employee-shifts-title">
            <span className="gradient-text">My Shifts</span>
          </h1>
          <p className="employee-shifts-subtitle">
            <span className="subtitle-icon">📅</span>
            View your scheduled shifts and work hours
          </p>
        </header>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {!error && shifts.length === 0 && (
          <div className="no-shifts-message">
            <span className="no-shifts-icon">📭</span>
            <h3>No Shifts Scheduled</h3>
            <p>You don't have any shifts scheduled at the moment.</p>
          </div>
        )}

        {!error && shifts.length > 0 && (
          <>
            {/* Ongoing Shifts */}
            {ongoingShifts.length > 0 && (
              <section className="shifts-section">
                <h2 className="section-title">
                  <span className="status-indicator ongoing"></span>
                  Currently Working
                </h2>
                <div className="shifts-grid">
                  {ongoingShifts.map((shift) => (
                    <div key={shift.assignId} className="shift-card ongoing">
                      <div className="shift-status-badge">🟢 Active Now</div>
                      <div className="shift-header">
                        <h3>{shift.locationName}</h3>
                        <span className="shift-duration">{calculateDuration(shift.scheduleStart, shift.scheduleEnd)}</span>
                      </div>
                      <div className="shift-details">
                        <div className="shift-info-row">
                          <span className="info-icon">📆</span>
                          <span className="info-text">{formatDate(shift.scheduleStart)}</span>
                        </div>
                        <div className="shift-info-row">
                          <span className="info-icon">🕐</span>
                          <span className="info-text">
                            {formatTime(shift.scheduleStart)} - {formatTime(shift.scheduleEnd)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Shifts */}
            {upcomingShifts.length > 0 && (
              <section className="shifts-section">
                <h2 className="section-title">
                  <span className="status-indicator upcoming"></span>
                  Upcoming Shifts
                </h2>
                <div className="shifts-grid">
                  {upcomingShifts.map((shift) => (
                    <div key={shift.assignId} className="shift-card upcoming">
                      <div className="shift-status-badge">⏳ Scheduled</div>
                      <div className="shift-header">
                        <h3>{shift.locationName}</h3>
                        <span className="shift-duration">{calculateDuration(shift.scheduleStart, shift.scheduleEnd)}</span>
                      </div>
                      <div className="shift-details">
                        <div className="shift-info-row">
                          <span className="info-icon">📆</span>
                          <span className="info-text">{formatDate(shift.scheduleStart)}</span>
                        </div>
                        <div className="shift-info-row">
                          <span className="info-icon">🕐</span>
                          <span className="info-text">
                            {formatTime(shift.scheduleStart)} - {formatTime(shift.scheduleEnd)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Past Shifts */}
            {pastShifts.length > 0 && (
              <section className="shifts-section">
                <h2 className="section-title">
                  <span className="status-indicator past"></span>
                  Past Shifts
                </h2>
                <div className="shifts-grid">
                  {pastShifts.slice(0, 10).map((shift) => (
                    <div key={shift.assignId} className="shift-card past">
                      <div className="shift-status-badge">✓ Completed</div>
                      <div className="shift-header">
                        <h3>{shift.locationName}</h3>
                        <span className="shift-duration">{calculateDuration(shift.scheduleStart, shift.scheduleEnd)}</span>
                      </div>
                      <div className="shift-details">
                        <div className="shift-info-row">
                          <span className="info-icon">📆</span>
                          <span className="info-text">{formatDate(shift.scheduleStart)}</span>
                        </div>
                        <div className="shift-info-row">
                          <span className="info-icon">🕐</span>
                          <span className="info-text">
                            {formatTime(shift.scheduleStart)} - {formatTime(shift.scheduleEnd)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {pastShifts.length > 10 && (
                  <p className="showing-recent">Showing 10 most recent past shifts</p>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};
