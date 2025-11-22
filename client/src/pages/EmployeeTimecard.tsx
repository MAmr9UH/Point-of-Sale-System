import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TopNav } from '../components/TopNav';
import { useToaster } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { authenticatedFetch } from '../utils/jwtAuth';
import './EmployeeTimecard.css';

interface TimecardEntry {
  TimecardID: number;
  StaffID: number;
  LocationName: string;
  ClockInTime: string;
  ClockOutTime: string | null;
  TotalHours: number;
}

export const EmployeeTimecard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const { addToast } = useToaster();
  const [activeTimecard, setActiveTimecard] = useState<TimecardEntry | null>(null);
  const [recentTimecards, setRecentTimecards] = useState<TimecardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (userType !== 'employee' && userType !== 'manager') {
      navigate('/login');
      return;
    }

    fetchTimecardData();
  }, [user, userType, navigate]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchTimecardData = async () => {
    try {
      setLoading(true);
      const staffId = (user as any)?.StaffID;

      if (!staffId) {
        addToast('Staff ID not found', 'error', 3000);
        return;
      }

      const response = await authenticatedFetch(`/api/timecard/staff/${staffId}`);
      const data = await response.json();

      if (response.ok) {
        setActiveTimecard(data.active);
        setRecentTimecards(data.recent);
      } else {
        throw new Error(data.error || 'Failed to fetch timecard data');
      }
    } catch (error: any) {
      addToast(error.message || 'Failed to load timecard', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      const staffId = (user as any)?.StaffID;
      const response = await authenticatedFetch('/api/timecard/clockin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId })
      });

      const data = await response.json();

      if (response.ok) {
        addToast('Successfully clocked in!', 'success', 3000);
        fetchTimecardData();
      } else {
        throw new Error(data.error || 'Failed to clock in');
      }
    } catch (error: any) {
      addToast(error.message || 'Failed to clock in', 'error', 3000);
    }
  };

  const handleClockOut = async () => {
    try {
      const response = await authenticatedFetch('/api/timecard/clockout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timecardId: activeTimecard?.TimecardID })
      });

      const data = await response.json();

      if (response.ok) {
        addToast(`Successfully clocked out! Total hours: ${data.totalHours}`, 'success', 4000);
        fetchTimecardData();
      } else {
        throw new Error(data.error || 'Failed to clock out');
      }
    } catch (error: any) {
      addToast(error.message || 'Failed to clock out', 'error', 3000);
    }
  };

  const formatTime = (dateString: string) => {
    // Remove 'Z' suffix to treat as local time
    const cleanedString = dateString.replace('Z', '');
    const date = new Date(cleanedString);
    // Subtract 12 hours offset
    const adjustedDate = new Date(date.getTime() - (12 * 60 * 60 * 1000));
    return adjustedDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    // Remove 'Z' suffix to treat as local time
    const cleanedString = dateString.replace('Z', '');
    const date = new Date(cleanedString);
    // Subtract 12 hours offset
    const adjustedDate = new Date(date.getTime() - (12 * 60 * 60 * 1000));
    return adjustedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateElapsedTime = (clockInTime: string) => {
    // Remove 'Z' suffix to treat as local time
    const cleanedString = clockInTime.replace('Z', '');
    const start = new Date(cleanedString);
    // Add 12 hour offset (12 * 60 * 60 * 1000 milliseconds)
    const adjustedStart = new Date(start.getTime() - (12 * 60 * 60 * 1000));
    const now = currentTime;
    const diff = now.getTime() - adjustedStart.getTime();
    
    // Handle negative differences
    if (diff < 0) return '00:00:00';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading timecard..." />;
  }

  return (
    <div className={`employee-timecard-container ${isLoaded ? 'loaded' : ''}`}>
      <TopNav />

      <div className="employee-timecard-content">
        <header className="employee-timecard-header">
          <button className="back-button" onClick={() => navigate('/employee')}>
            ← Back to Dashboard
          </button>
          <h1 className="employee-timecard-title">
            <span className="gradient-text">Time Clock</span>
          </h1>
          <p className="employee-timecard-subtitle">
            <span className="subtitle-icon">🕐</span>
            Track your work hours
          </p>
        </header>

        {/* Current Time Display */}
        <div className="current-time-display">
          <div className="current-time">
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })}
          </div>
          <div className="current-date">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>

        {/* Active Timecard or Clock In Button */}
        <div className="clock-action-section">
          {activeTimecard ? (
            <div className="active-timecard-card">
              <div className="status-badge active">🟢 Currently Clocked In</div>
              <div className="timecard-info">
                <div className="info-row">
                  <span className="info-label">Location:</span>
                  <span className="info-value">{activeTimecard.LocationName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Clock In:</span>
                  <span className="info-value">{formatTime(activeTimecard.ClockInTime)}</span>
                </div>
                <div className="info-row highlight">
                  <span className="info-label">Elapsed Time:</span>
                  <span className="info-value elapsed-time">
                    {calculateElapsedTime(activeTimecard.ClockInTime)}
                  </span>
                </div>
              </div>
              <button className="clock-out-btn" onClick={handleClockOut}>
                <span className="btn-icon">⏹</span>
                Clock Out
              </button>
            </div>
          ) : (
            <div className="clock-in-card">
              <div className="clock-in-icon">⏱️</div>
              <h2>Ready to Start Your Shift?</h2>
              <p>Click the button below to clock in</p>
              <button className="clock-in-btn" onClick={handleClockIn}>
                <span className="btn-icon">▶</span>
                Clock In
              </button>
            </div>
          )}
        </div>

        {/* Recent Timecards */}
        {recentTimecards.length > 0 && (
          <section className="recent-timecards-section">
            <h2 className="section-title">Recent Time Entries</h2>
            <div className="timecards-list">
              {recentTimecards.map((timecard) => (
                <div key={timecard.TimecardID} className="timecard-item">
                  <div className="timecard-header">
                    <span className="timecard-location">{timecard.LocationName}</span>
                    <span className="timecard-hours">{Number(timecard.TotalHours).toFixed(2)} hrs</span>
                  </div>
                  <div className="timecard-details">
                    <div className="timecard-detail-row">
                      <span className="detail-label">📅 Date:</span>
                      <span className="detail-value">{formatDate(timecard.ClockInTime)}</span>
                    </div>
                    <div className="timecard-detail-row">
                      <span className="detail-label">🕐 In:</span>
                      <span className="detail-value">{formatTime(timecard.ClockInTime)}</span>
                    </div>
                    <div className="timecard-detail-row">
                      <span className="detail-label">🕐 Out:</span>
                      <span className="detail-value">
                        {timecard.ClockOutTime ? formatTime(timecard.ClockOutTime) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
