import React, { useState } from 'react';

import type { Ingredient } from "./InventoryTab.tsx";

interface InventoryFormProps {
  status: string;
  setStatus: (value: string) => void;
  selectedIngredient: string;
  setSelectedIngredient: (value: string) => void;
  selectedIngredientId: number | null;
  setSelectedIngredientId: (value: number | null) => void;
  showIngredients: boolean;
  setShowIngredients: (value: boolean) => void;
  receivedDate: string;
  setReceivedDate: (value: string) => void;
  quantity: string;
  setQuantity: (value: string) => void;
  ingredients: Ingredient[];
  onSave: () => void;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({
  status,
  setStatus,
  selectedIngredient,
  setSelectedIngredient,
  selectedIngredientId,
  setSelectedIngredientId,
  showIngredients,
  setShowIngredients,
  receivedDate,
  setReceivedDate,
  quantity,
  setQuantity,
  ingredients,
  onSave
}) => {
  const [ingredientSearch, setIngredientSearch] = useState('');

  // Calculate total cost automatically
  const selectedIngredientData = ingredients.find(ing => ing.IngredientID === selectedIngredientId);
  const quantityNum = parseFloat(quantity || '0');
  const totalCost = selectedIngredientData && quantityNum > 0
    ? (selectedIngredientData.CostPerUnit * quantityNum).toFixed(2)
    : '0.00';

  const filteredIngredients = ingredients.filter(item =>
    item.Name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  // Validation handler for quantity
  const handleQuantityChange = (value: string) => {
    const numValue = parseFloat(value);
    if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
      setQuantity(value);
    }
  };

  return (
    <>
      <h2>Add Inventory Order</h2>

      <div className="form-group">
        <label>Status:</label>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Select Status</option>
          <option value="pending">Pending</option>
          <option value="received">Received</option>
          <option value="delayed">Delayed</option>
        </select>
      </div>

      <div className="form-group">
        <label>Ingredient Item:</label>
        <div style={{ position: 'relative', color: 'black' }}>
          <input
            type="text"
            placeholder="Select Ingredient"
            value={selectedIngredient}
            onClick={() => setShowIngredients(!showIngredients)}
            readOnly
            style={{ cursor: 'pointer' }}
          />
          {showIngredients && (
            <div className="dropdown-menu">
              <div style={{ padding: '8px', borderBottom: '1px solid #ddd', position: 'sticky', top: 0, background: 'white' }}>
                <input
                  type="text"
                  placeholder="Search ingredients..."
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              {filteredIngredients.length > 0 ? (
                filteredIngredients.map((item, i) => (
                  <div
                    key={i}
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedIngredient(item.Name);
                      setSelectedIngredientId(item.IngredientID);
                      setShowIngredients(false);
                      setIngredientSearch('');
                    }}
                  >
                    <span className="dropdown-item-name">{item.Name}</span>
                    <span className="dropdown-item-cost">+${Number(item.CostPerUnit).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
                  No ingredients found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>Shipment Received Date:</label>
        <input
          type="date"
          value={receivedDate}
          onChange={e => setReceivedDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Quantity Resupply:</label>
        <input
          type="number"
          value={quantity}
          onChange={e => handleQuantityChange(e.target.value)}
          placeholder="0"
          min="0"
          step="1"
        />
      </div>

      <div className="form-group">
        <label>Total Cost:</label>
        <input
          type="text"
          value={`$${totalCost}`}
          readOnly
          style={{ 
            backgroundColor: '#f5f5f5', 
            cursor: 'not-allowed',
            fontWeight: 'bold',
            color: '#333'
          }}
          title={selectedIngredientData 
            ? `${quantity || 0} × $${Number(selectedIngredientData.CostPerUnit).toFixed(2)} per unit`
            : 'Select an ingredient and enter quantity'
          }
        />
      </div>

      <button className="btn-primary" onClick={onSave}>
        Save Inventory Order
      </button>
    </>
  );
};
