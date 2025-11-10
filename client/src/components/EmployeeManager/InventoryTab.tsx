import React, { useState, useEffect } from 'react';
import { InventoryForm } from './InventoryForm';
import { InventoryList } from './InventoryList';

const INGREDIENTS = [
  { name: 'Example French Toast', cost: 1.0 },
  { name: 'Example item1', cost: 1.0 },
  { name: 'Example Avocado', cost: 1.0 },
  { name: 'Example Fruit', cost: 1.0 },
  { name: 'Example meat', cost: 1.0 },
];

export const InventoryTab: React.FC = () => {
  const [supplierName, setSupplierName] = useState('');
  const [status, setStatus] = useState('');
  const [locationName, setLocationName] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [showIngredients, setShowIngredients] = useState(false);
  const [receivedDate, setReceivedDate] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [inventoryList, setInventoryList] = useState<any[]>([]);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      setInventoryList(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const handleSaveInventoryOrder = async () => {
    try {
      const payload = {
        supplierName,
        status,
        locationName,
        ingredientItem: selectedIngredient || 'Example Ingredient',
        receivedDate,
        costPerUnit: parseFloat(costPerUnit),
        quantity: parseInt(quantity),
      };

      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      console.log('✅ Inventory order saved:', data);
      alert('Inventory order saved successfully!');

      setSupplierName('');
      setStatus('');
      setLocationName('');
      setSelectedIngredient('');
      setReceivedDate('');
      setCostPerUnit('');
      setQuantity('');

      await loadInventory();
    } catch (err) {
      console.error('❌ Error saving inventory order:', err);
      alert('Failed to save inventory order. Check console.');
    }
  };

  return (
    <div className="form-container">
      <div className="page-header">
        <h1 className="page-title">Inventory Management</h1>
        <p className="page-subtitle">Manage inventory orders and track stock levels</p>
      </div>

      <div className="content-card">
        <InventoryForm
          supplierName={supplierName}
          setSupplierName={setSupplierName}
          status={status}
          setStatus={setStatus}
          locationName={locationName}
          setLocationName={setLocationName}
          selectedIngredient={selectedIngredient}
          setSelectedIngredient={setSelectedIngredient}
          showIngredients={showIngredients}
          setShowIngredients={setShowIngredients}
          receivedDate={receivedDate}
          setReceivedDate={setReceivedDate}
          costPerUnit={costPerUnit}
          setCostPerUnit={setCostPerUnit}
          quantity={quantity}
          setQuantity={setQuantity}
          ingredients={INGREDIENTS}
          onSave={handleSaveInventoryOrder}
        />

        <InventoryList inventory={inventoryList} />
      </div>
    </div>
  );
};
