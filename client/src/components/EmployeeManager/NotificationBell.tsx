import React, { useState, useEffect, useRef } from 'react';
import { NotificationDropdown } from './NotificationDropdown';

export const NotificationBell: React.FC = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 1000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/staff/notifications/unread-count');
      const data = await response.json();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <div style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 999 }}>
      <button
        ref={bellRef}
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        style={{
          position: 'relative',
          background: '#2f2f2f',
          border: '2px solid #444',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#3a3a3a';
          e.currentTarget.style.borderColor = 'var(--color1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#2f2f2f';
          e.currentTarget.style.borderColor = '#444';
        }}
      >
        <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#ff4444',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            border: '2px solid #1a1a1a'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)}
        bellRef={bellRef}
      />
    </div>
  );
};
