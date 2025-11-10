import React from 'react';

interface InventoryFormProps {
  supplierName: string;
  setSupplierName: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  locationName: string;
  setLocationName: (value: string) => void;
  selectedIngredient: string;
  setSelectedIngredient: (value: string) => void;
  showIngredients: boolean;
  setShowIngredients: (value: boolean) => void;
  receivedDate: string;
  setReceivedDate: (value: string) => void;
  costPerUnit: string;
  setCostPerUnit: (value: string) => void;
  quantity: string;
  setQuantity: (value: string) => void;
  ingredients: { name: string; cost: number }[];
  onSave: () => void;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({
  supplierName,
  setSupplierName,
  status,
  setStatus,
  locationName,
  setLocationName,
  selectedIngredient,
  setSelectedIngredient,
  showIngredients,
  setShowIngredients,
  receivedDate,
  setReceivedDate,
  costPerUnit,
  setCostPerUnit,
  quantity,
  setQuantity,
  ingredients,
  onSave
}) => {
  return (
    <>
      <h2>Add Inventory Order</h2>

      <div className="form-group">
        <label>Supplier Name:</label>
        <input
          type="text"
          value={supplierName}
          onChange={e => setSupplierName(e.target.value)}
          placeholder="Enter supplier name"
        />
      </div>

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
        <label>Location Name:</label>
        <input
          type="text"
          value={locationName}
          onChange={e => setLocationName(e.target.value)}
          placeholder="Enter location name"
        />
      </div>

      <div className="form-group">
        <label>Ingredient Item:</label>
        <div style={{ position: 'relative' }}>
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
              {ingredients.map((item, i) => (
                <div
                  key={i}
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedIngredient(item.name);
                    setShowIngredients(false);
                  }}
                >
                  <span className="dropdown-item-name">{item.name}</span>
                  <span className="dropdown-item-cost">+${item.cost.toFixed(2)}</span>
                </div>
              ))}
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
        <label>Cost per Unit:</label>
        <input
          type="number"
          value={costPerUnit}
          onChange={e => setCostPerUnit(e.target.value)}
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <div className="form-group">
        <label>Quantity Resupply:</label>
        <input
          type="number"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          placeholder="0"
        />
      </div>

      <button className="btn-primary" onClick={onSave}>
        Save Inventory Order
      </button>
    </>
  );
};
