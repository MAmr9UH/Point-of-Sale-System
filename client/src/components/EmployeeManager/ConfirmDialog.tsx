import React, { useState, useEffect } from 'react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      onConfirm();
    }, 300);
  };

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(() => {
      onCancel();
    }, 300);
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleCancel}
      style={{
        opacity: isVisible && !isClosing ? 1 : 0,
        transition: 'opacity 0.3s ease-out',
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: isVisible && !isClosing ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isVisible && !isClosing ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          maxWidth: '500px',
          padding: 0,
        }}
      >
        <div className="modal-header" style={{ borderBottom: '2px solid #ecf0f1', paddingBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#2c3e50' }}>{title}</h2>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem 2rem' }}>
          <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6', margin: 0 }}>
            {message}
          </p>
        </div>

        <div 
          className="modal-footer" 
          style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end',
            padding: '1rem 2rem 2rem',
            borderTop: '1px solid #ecf0f1',
          }}
        >
          <button
            onClick={handleCancel}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#95a5a6',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7f8c8d';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#95a5a6';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: isDangerous ? '#e74c3c' : '#3498db',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDangerous ? '#c0392b' : '#2980b9';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDangerous ? '#e74c3c' : '#3498db';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
