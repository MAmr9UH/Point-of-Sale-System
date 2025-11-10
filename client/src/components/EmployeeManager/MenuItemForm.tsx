import React, { useState, useEffect } from 'react';
import { CloseIcon, TrashIcon, SaveIcon, CreateIcon } from './Icons';
import type { MenuItem } from '../../types/MenuItem';

interface MenuItemFormProps {
  editingItem: MenuItem | null;
  itemName: string;
  setItemName: (value: string) => void;
  itemDescription: string;
  setItemDescription: (value: string) => void;
  itemPrice: string;
  setItemPrice: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  available: boolean;
  setAvailable: (value: boolean) => void;
  imageURL: string;
  setImageURL: (value: string) => void;
  isSaving: boolean;
  saveMessage: string;
  onSave: () => void;
  onClose: () => void;
  onDelete?: () => void;
  isFormValid: boolean;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  editingItem,
  itemName,
  setItemName,
  itemDescription,
  setItemDescription,
  itemPrice,
  setItemPrice,
  category,
  setCategory,
  available,
  setAvailable,
  imageURL,
  setImageURL,
  isSaving,
  saveMessage,
  onSave,
  onClose,
  onDelete,
  isFormValid
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger opening animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  useEffect(() => {
    // Auto-close on successful save
    if (saveMessage.includes('✔') && !isSaving) {
      setTimeout(() => {
        setIsClosing(true);
        setTimeout(onClose, 300);
      }, 1500);
    }
  }, [saveMessage, isSaving, onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const handleSaveAndClose = () => {
    onSave();
    // Auto-close is handled by useEffect watching saveMessage
  };

  return (
    <div
      className={`modal-overlay ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
      style={{
        opacity: isVisible && !isClosing ? 1 : 0,
        transition: 'opacity 0.3s ease-out'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: isVisible && !isClosing ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isVisible && !isClosing ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <div className="modal-header">
          <h2>{editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}</h2>
          <button className="modal-close" onClick={handleClose}>
            <CloseIcon style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Image URL:</label>
            <input
              type="url"
              value={imageURL}
              onChange={e => setImageURL(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            {imageURL && (
              <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                <img
                  src={imageURL}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Item Name:</label>
            <input
              type="text"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              placeholder="Enter item name"
            />
          </div>

          <div className="form-group">
            <label>Item Description:</label>
            <textarea
              value={itemDescription}
              onChange={e => setItemDescription(e.target.value)}
              placeholder="Describe your menu item"
            />
          </div>

          <div className="form-group">
            <label>Item Price:</label>
            <input
              type="number"
              value={itemPrice}
              onChange={e => setItemPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Category:</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select category</option>
              <option value="appetizer">Appetizer</option>
              <option value="entree">Entree</option>
              <option value="dessert">Dessert</option>
              <option value="beverage">Beverage</option>
            </select>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <label>Available:</label>
              <input
                type="checkbox"
                checked={available}
                onChange={() => setAvailable(!available)}
              />
              <span>{available ? 'Available' : 'Sold Out'}</span>
            </div>
          </div>
          <div style={{ 
            display: 'flex',
            gap: '0.75rem',
            marginTop: '1rem',
            alignItems: 'stretch'
          }}>

            {editingItem && onDelete && (
              <button
                className="btn-delete"
                onClick={onDelete}
                disabled={isSaving}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  opacity: isSaving ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '50px'
                }}
                onMouseEnter={(e) => {
                  if (!isSaving) e.currentTarget.style.background = '#dc2626';
                }}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
              >
                <TrashIcon style={{ width: '20px', height: '20px' }} />
              </button>
            )}

            <button
              className="btn-primary"
              onClick={handleSaveAndClose}
              disabled={!isFormValid || isSaving}
              style={{
                flex: editingItem ? '1' : '1 0 100%',
                padding: '0.75rem'
              }}
            >
              {isSaving ? 'Saving...' : editingItem ?
                (<div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                  Update <SaveIcon />
                </div>) :
                (<div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                  Create <CreateIcon />
                </div>)}
            </button>
          </div>

          {saveMessage && (
            <div className={`save-message ${saveMessage.includes('✔') ? 'success' : 'error'}`}>
              {saveMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
