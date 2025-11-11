import React from 'react';
import { EditIcon, TrashIcon } from './Icons';
import type { InventoryOrder } from './InventoryTab.tsx';

interface InventoryListProps {
  inventory: InventoryOrder[];
  onEdit?: (order: InventoryOrder) => void;
  onDelete?: (order: InventoryOrder) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ inventory, onEdit, onDelete }) => {
  if (inventory.length === 0) return null;

  return (
    <>
      <hr className="section-divider" />
      <h2>Saved Inventory Orders</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Item</th>
            <th>Cost</th>
            <th>Qty</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((order, i) => (
            <tr key={i}>
              <td style={{ textTransform: 'capitalize' }}>{order.status}</td>
              <td>{order.ingredientItem}</td>
              <td>${parseFloat(order.costPerUnit).toFixed(2)}</td>
              <td>{order.quantity}</td>
              <td>{order.receivedDate}</td>
              <td>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {onEdit && (
                    <button
                      className="icon-button edit-button"
                      onClick={() => onEdit(order)}
                      title="Edit inventory order"
                    >
                      <EditIcon />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="icon-button delete-button"
                      onClick={() => onDelete(order)}
                      title="Delete inventory order"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
