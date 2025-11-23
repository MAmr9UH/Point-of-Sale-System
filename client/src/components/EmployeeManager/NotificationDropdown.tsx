import React, { useState, useEffect, useRef } from 'react';
import { authenticatedFetch } from '../../utils/jwtAuth';

interface Notification {
  NotificationID: number;
  Message: string;
  Status: 'read' | 'unread';
  CreatedAt: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  bellRef: React.RefObject<HTMLButtonElement | null>;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  isOpen, 
  onClose, 
  bellRef 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      markAllAsRead();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current && 
        !panelRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, bellRef]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch('/api/staff/notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await authenticatedFetch('/api/staff/notifications/read-all', {
        method: 'PUT'
      });
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, Status: 'read' }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={panelRef}
      style={{
        position: 'fixed',
        right: '2rem',
        top: '5rem',
        width: '400px',
        maxWidth: '90vw',
        maxHeight: '500px',
        background: '#2f2f2f',
        borderRadius: '10px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        border: '1px solid #444',
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid #444',
        background: '#1a1a1a'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Notifications</h3>
      </div>

      {/* Notification List */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔔</div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>No notifications</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>You're all caught up!</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification.NotificationID}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid #444',
                  background: notification.Status === 'unread' ? '#3a2f1f' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Low Stock Alert</span>
                      {notification.Status === 'unread' && (
                        <span style={{
                          width: '8px',
                          height: '8px',
                          background: 'var(--color1)',
                          borderRadius: '50%',
                          display: 'inline-block'
                        }}></span>
                      )}
                    </div>
                    
                    <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#ddd' }}>
                      {notification.Message}
                    </p>
                    
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>
                      {formatTimestamp(notification.CreatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div style={{
          padding: '0.75rem',
          background: '#1a1a1a',
          borderTop: '1px solid #444',
          textAlign: 'center'
        }}>
          <button 
            onClick={fetchNotifications}
            style={{
              background: 'none',
              border: 'none',
              color: '#6fd3f1ff',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Refresh notifications
          </button>
        </div>
      )}
    </div>
  );
};
