import React, { useState, useEffect } from 'react';
import { CloseIcon } from './Icons';
import type { Ingredient } from '../../types/Ingredient';

interface IngredientsFormProps {
  editingIngredient: Ingredient | null;
  name: string;
  setName: (value: string) => void;
  costPerUnit: string;
  setCostPerUnit: (value: string) => void;
  quantityInStock: string;
  setQuantityInStock: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export const IngredientsForm: React.FC<IngredientsFormProps> = ({
  editingIngredient,
  name,
  setName,
  costPerUnit,
  setCostPerUnit,
  quantityInStock,
  setQuantityInStock,
  onSave,
  onClose,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const isFormValid = name.trim() !== '' && 
                      costPerUnit !== '' && 
                      quantityInStock !== '' &&
                      parseFloat(costPerUnit) >= 0 &&
                      parseInt(quantityInStock) >= 0;

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
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: isVisible && !isClosing ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isVisible && !isClosing ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div className="modal-header">
          <h2>{editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}</h2>
          <button className="modal-close" onClick={handleClose}>
            <CloseIcon style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Ingredient Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter ingredient name"
              maxLength={30}
              required
            />
          </div>

          <div className="form-group">
            <label>Cost per Unit ($):</label>
            <input
              type="number"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Quantity in Stock:</label>
            <input
              type="number"
              value={quantityInStock}
              onChange={(e) => setQuantityInStock(e.target.value)}
              placeholder="0"
              step="1"
              min="0"
              required
            />
          </div>

          <button
            className="btn-primary"
            onClick={onSave}
            disabled={!isFormValid}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {editingIngredient ? 'Update Ingredient' : 'Add Ingredient'}
          </button>
        </div>
      </div>
    </div>
  );
};
