import React from 'react';

interface InventoryOrder {
  supplierName: string;
  status: string;
  locationName: string;
  ingredientItem: string;
  costPerUnit: string;
  quantity: string;
  receivedDate: string;
}

interface InventoryListProps {
  inventory: InventoryOrder[];
}

export const InventoryList: React.FC<InventoryListProps> = ({ inventory }) => {
  if (inventory.length === 0) return null;

  return (
    <>
      <hr className="section-divider" />
      <h2>Saved Inventory Orders</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Status</th>
            <th>Location</th>
            <th>Item</th>
            <th>Cost/Unit</th>
            <th>Qty</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((order, i) => (
            <tr key={i}>
              <td>{order.supplierName}</td>
              <td style={{ textTransform: 'capitalize' }}>{order.status}</td>
              <td>{order.locationName}</td>
              <td>{order.ingredientItem}</td>
              <td>${parseFloat(order.costPerUnit).toFixed(2)}</td>
              <td>{order.quantity}</td>
              <td>{order.receivedDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
