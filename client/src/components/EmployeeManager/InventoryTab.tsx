import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../../utils/jwtAuth';
import { InventoryForm } from './InventoryForm';
import { InventoryList } from './InventoryList';
import { ConfirmDialog } from './ConfirmDialog';
import { useToaster } from '../../contexts/ToastContext';

export interface Ingredient {
  IngredientID: number;
  Name: string;
  CostPerUnit: number;
}

export interface InventoryOrder {
  id?: number;
  status: string;
  ingredientId?: number | null;
  ingredientItem: string;
  costPerUnit: string;
  quantity: string;
  receivedDate: string;
}

export const InventoryTab: React.FC = () => {
  const { addToast } = useToaster();
  const [status, setStatus] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [selectedIngredientId, setSelectedIngredientId] = useState<number | null>(null);
  const [showIngredients, setShowIngredients] = useState(false);
  const [receivedDate, setReceivedDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [inventoryList, setInventoryList] = useState<InventoryOrder[]>([]);
  const [ingredients, setIngredients] = useState<{ IngredientID: number; Name: string; CostPerUnit: number }[]>([]);
  const [editingOrder, setEditingOrder] = useState<InventoryOrder | null>(null);
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [threshold, setThreshold] = useState(10);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['pending', 'received', 'delayed']);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    loadInventory();
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const response = await authenticatedFetch('/api/ingredients');
      const data: Ingredient[] = await response.json();
      // Map costPerUnit to cost for compatibility with the form
      setIngredients(data.map(ing => ({ IngredientID: ing.IngredientID, Name: ing.Name, CostPerUnit: ing.CostPerUnit })));
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await authenticatedFetch('/api/inventory');
      const data = await response.json();
      setInventoryList(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const loadThreshold = async () => {
    try {
      const response = await fetch('/api/settings/low-stock-threshold');
      const data = await response.json();
      setThreshold(data.LowStockThreshold); // Changed to match your column name
    } catch (error) {
      console.error('Error loading threshold:', error);
    }
  };

  const saveThreshold = async () => {
  const thresholdNum = parseInt(threshold.toString()) || 1;
  
  if (thresholdNum < 1 || thresholdNum > 30) {
    addToast('Threshold must be between 1 and 30', 'error', 3000);
    return;
  }

  try {
    const response = await fetch('/api/settings/low-stock-threshold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threshold: thresholdNum })
    });

    if (response.ok) {
      addToast('Stock threshold updated successfully!', 'success', 3000);
      setShowThresholdModal(false);
    }
  } catch (error) {
    console.error('Error updating threshold:', error);
    addToast('Failed to update threshold', 'error', 3000);
  }
};

  const handleSaveInventoryOrder = async () => {
    try {
      // Validate quantity
      const quantityNum = parseInt(quantity || '0');
      if (quantityNum < 0) {
        addToast('Quantity cannot be less than 0', 'error', 3000);
        return;
      }

      // Calculate total cost: CostPerUnit * quantity
      const selectedIngredientData = ingredients.find(ing => ing.IngredientID === selectedIngredientId);
      const totalCost = selectedIngredientData 
        ? selectedIngredientData.CostPerUnit * quantityNum
        : 0;

      const payload = {
        status,
        ingredientId: selectedIngredientId,
        ingredientItem: selectedIngredient || 'Example Ingredient',
        receivedDate,
        costPerUnit: totalCost, // Total cost (not per unit)
        quantity: quantityNum,
      };

      const method = editingOrder ? 'PUT' : 'POST';
      const url = editingOrder 
        ? `/api/inventory/${editingOrder.id}` 
        : '/api/inventory';

      const res = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      addToast(
        editingOrder ? 'Inventory order updated successfully!' : 'Inventory order saved successfully!',
        'success',
        3000
      );

      setStatus('');
      setSelectedIngredient('');
      setSelectedIngredientId(null);
      setReceivedDate('');
      setQuantity('');
      setEditingOrder(null);

      await loadInventory();
    } catch (err) {
      console.error('❌ Error saving inventory order:', err);
      addToast(
        err instanceof Error ? err.message : 'Failed to save inventory order. Please try again.',
        'error',
        5000
      );
    }
  };

  const handleEditInventoryOrder = (order: InventoryOrder) => {
    setStatus(order.status);
    setSelectedIngredient(order.ingredientItem);
    setSelectedIngredientId(order.ingredientId || null);
    setReceivedDate(order.receivedDate);
    setQuantity(order.quantity.toString());
    setEditingOrder(order);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteInventoryOrder = (order: InventoryOrder) => {
    setConfirmDialog({
      show: true,
      title: 'Delete Inventory Order',
      message: `Are you sure you want to delete the order for "${order.ingredientItem}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const res = await authenticatedFetch(`/api/inventory/${order.id}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to delete inventory order');
          }

          addToast('Inventory order deleted successfully!', 'success', 3000);
          setConfirmDialog(null);
          await loadInventory();
        } catch (err) {
          console.error('❌ Error deleting inventory order:', err);
          addToast(
            err instanceof Error ? err.message : 'Failed to delete inventory order. Please try again.',
            'error',
            5000
          );
          setConfirmDialog(null);
        }
      },
    });
  };

  // Toggle status selection
  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  // Filter inventory by selected statuses
  const filteredInventory = selectedStatuses.length === 0 
    ? inventoryList 
    : inventoryList.filter(order => selectedStatuses.includes(order.status));

  // Calculate total cost (costPerUnit already contains the total cost)
  const totalCost = filteredInventory.reduce((sum, order) => {
    const cost = parseFloat(order.costPerUnit);
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  return (
    <div className="form-container">
      <div className="page-header">
        <h1 className="page-title">Inventory Management</h1>
        <p className="page-subtitle">Manage inventory orders and track stock levels</p>
      </div>
  <button
    onClick={() => {
      loadThreshold();
      setShowThresholdModal(true);
    }}
    style={{
      padding: '10px 20px',
      backgroundColor: '#6366f1',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
      marginBottom: '20px'
    }}
  >
    Edit Stock Quantity Notifications
  </button>
      {showThresholdModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      minWidth: '400px'
    }}>
      <h3 style={{ marginTop: 0 }}>Low Stock Alert Threshold</h3>
      <p style={{ color: '#6b7280', fontSize: '14px' }}>
        Alert when ingredient stock falls below:
      </p>
      
     <input
      type="number"
      value={threshold}
      onChange={(e) => setThreshold(parseInt(e.target.value))}
      min="1"
      max="30"
      style={{
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        marginBottom: '20px'
      }}
    />
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowThresholdModal(false)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e5e7eb',
            color: '#374151',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          Cancel
        </button>
        <button
          onClick={saveThreshold}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
      <div className="content-card">
        {editingOrder && (
          <div style={{
            background: '#dbeafe',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#1e40af', fontWeight: 500 }}>
              ✏️ Editing: {editingOrder.ingredientItem}
            </span>
            <button
              onClick={() => {
                setEditingOrder(null);
                setStatus('');
                setSelectedIngredient('');
                setSelectedIngredientId(null);
                setReceivedDate('');
                setQuantity('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1e40af',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Cancel
            </button>
          </div>
        )}
        
        <InventoryForm
          status={status}
          setStatus={setStatus}
          selectedIngredient={selectedIngredient}
          setSelectedIngredient={setSelectedIngredient}
          selectedIngredientId={selectedIngredientId}
          setSelectedIngredientId={setSelectedIngredientId}
          showIngredients={showIngredients}
          setShowIngredients={setShowIngredients}
          receivedDate={receivedDate}
          setReceivedDate={setReceivedDate}
          quantity={quantity}
          setQuantity={setQuantity}
          ingredients={ingredients}
          onSave={handleSaveInventoryOrder}
        />

        <hr className="section-divider" />
        
        {inventoryList.length > 0 && (
          <>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '16px',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <h2 style={{ margin: 0 }}>Saved Inventory Orders</h2>

              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '16px 24px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                minWidth: '200px'
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Total Cost
                  {selectedStatuses.length > 0 && selectedStatuses.length < 3 && 
                    ` (${selectedStatuses.join(', ')})`
                  }
                </div>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: 700,
                  color: 'white'
                }}>
                  ${totalCost.toFixed(2)}
                </div>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '20px',
              padding: '12px 16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              flexWrap: 'wrap'
            }}>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 600,
                color: '#374151'
              }}>
                Filter by Status:
              </span>
              
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => toggleStatus('pending')}
                  style={{
                    padding: '8px 16px',
                    border: selectedStatuses.includes('pending') ? '2px solid #f59e0b' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    backgroundColor: selectedStatuses.includes('pending') ? '#f59e0b' : 'white',
                    color: selectedStatuses.includes('pending') ? 'white' : '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedStatuses.includes('pending')) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedStatuses.includes('pending')) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  ⏳ Pending
                </button>

                <button
                  onClick={() => toggleStatus('received')}
                  style={{
                    padding: '8px 16px',
                    border: selectedStatuses.includes('received') ? '2px solid #10b981' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    backgroundColor: selectedStatuses.includes('received') ? '#10b981' : 'white',
                    color: selectedStatuses.includes('received') ? 'white' : '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedStatuses.includes('received')) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedStatuses.includes('received')) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  ✅ Received
                </button>

                <button
                  onClick={() => toggleStatus('delayed')}
                  style={{
                    padding: '8px 16px',
                    border: selectedStatuses.includes('delayed') ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    backgroundColor: selectedStatuses.includes('delayed') ? '#ef4444' : 'white',
                    color: selectedStatuses.includes('delayed') ? 'white' : '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedStatuses.includes('delayed')) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedStatuses.includes('delayed')) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  ⚠️ Delayed
                </button>
              </div>

              <span style={{
                fontSize: '13px',
                color: '#6b7280',
                marginLeft: 'auto'
              }}>
                Showing {filteredInventory.length} of {inventoryList.length} orders
              </span>
            </div>
          </>
        )}

        <InventoryList 
          inventory={filteredInventory} 
          onEdit={handleEditInventoryOrder}
          onDelete={handleDeleteInventoryOrder}
        />
      </div>

      {confirmDialog?.show && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
          isDangerous={true}
        />
      )}
    </div>
  );
};
