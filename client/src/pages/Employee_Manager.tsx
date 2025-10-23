import React, { useState } from 'react';
import '../index.css';

const Employee_Manager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'menu' | 'management'>('menu');
  const [available, setAvailable] = useState(true);
  const [managementView, setManagementView] = useState<'none' | 'utilities' | 'inventory'>('none');

  return (
    <div style={{ width: '100%', maxWidth: '750px', margin: '0 auto', textAlign: 'center' }}>
      <h1>Employee / Manager</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('menu')}
          style={{
            marginRight: '10px',
            backgroundColor: activeTab === 'menu' ? 'var(--color1)' : '#1a1a1a',
            color: 'white',
          }}
        >
          Menu Items
        </button>
        <button
          onClick={() => setActiveTab('management')}
          style={{
            backgroundColor: activeTab === 'management' ? 'var(--color1)' : '#1a1a1a',
            color: 'white',
          }}
        >
          Management Menu
        </button>
      </div>

      {/* -------------------- MENU ITEMS TAB -------------------- */}
      {activeTab === 'menu' && (
        <div style={{ textAlign: 'left', background: '#2f2f2f', padding: '1.5rem', borderRadius: '10px' }}>
          <h2 style={{ textAlign: 'center' }}>Create Menu Item</h2>

          <div
            style={{
              width: '100%',
              height: '150px',
              border: '2px dashed gray',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              borderRadius: '8px',
              background: '#1a1a1a',
            }}
          >
            <p>Image Placeholder (order item)</p>
          </div>

          <label>Item Name:</label>
          <input type="text" placeholder="Enter item name" style={{ width: '100%', marginBottom: '1rem' }} />

          <label>Item Description:</label>
          <textarea placeholder="Enter description" style={{ width: '100%', marginBottom: '1rem' }} />

          <label>Item Price:</label>
          <input type="number" placeholder="Enter price" style={{ width: '100%', marginBottom: '1rem' }} />

          <label>Category:</label>
          <select style={{ width: '100%', marginBottom: '1rem' }}>
            <option value="">Select category</option>
            <option value="food">Food</option>
            <option value="drink">Drink</option>
            <option value="dessert">Dessert</option>
          </select>

          <label>Remaining Stock:</label>
          <input type="number" placeholder="Enter stock" style={{ width: '100%', marginBottom: '1rem' }} />

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ marginRight: '10px' }}>Available:</label>
            <input
              type="checkbox"
              checked={available}
              onChange={() => setAvailable(!available)}
              style={{ transform: 'scale(1.2)' }}
            />
            <span style={{ marginLeft: '8px' }}>{available ? 'Available' : 'Sold Out'}</span>
          </div>

          <button disabled style={{ width: '100%', backgroundColor: '#444' }}>
            Save (inactive)
          </button>
        </div>
      )}

      {/* -------------------- MANAGEMENT MENU TAB -------------------- */}
      {activeTab === 'management' && (
        <div style={{ textAlign: 'center', background: '#2f2f2f', padding: '2rem', borderRadius: '10px' }}>
          <h2>Management Menu</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <button style={{ width: '70%' }} onClick={() => setManagementView('utilities')}>
              Add Utilities Payments
            </button>
            <button style={{ width: '70%' }} onClick={() => setManagementView('inventory')}>
              Create Inventory Orders
            </button>
          </div>

          {/* Dynamic View Section */}
          <div style={{ marginTop: '2rem', background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', textAlign: 'left' }}>
            {managementView === 'utilities' && (
              <div>
                <h3 style={{ textAlign: 'center' }}>Add Utilities Payments</h3>
                <label>Payment ID:</label>
                <input type="text" placeholder="Enter Payment ID" style={{ width: '100%', marginBottom: '1rem' }} />

                <label>Type:</label>
                <select style={{ width: '100%', marginBottom: '1rem' }}>
                  <option value="">Select Type</option>
                  <option value="water">Water</option>
                  <option value="electricity">Electricity</option>
                  <option value="gas">Gas</option>
                </select>

                <label>Total Amount:</label>
                <input type="number" placeholder="Enter Total Amount" style={{ width: '100%', marginBottom: '1rem' }} />

                <label>Date:</label>
                <input type="date" style={{ width: '100%', marginBottom: '1rem' }} />

                <button disabled style={{ width: '100%', backgroundColor: '#444' }}>
                  Save Utility Payment (inactive)
                </button>
              </div>
            )}

            {managementView === 'inventory' && (
              <div>
                <h3 style={{ textAlign: 'center' }}>Create Inventory Order</h3>
                <label>Supplier Name:</label>
                <input type="text" placeholder="Enter Supplier Name" style={{ width: '100%', marginBottom: '1rem' }} />

                <label>Status:</label>
                <select style={{ width: '100%', marginBottom: '1rem' }}>
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="received">Received</option>
                  <option value="delayed">Delayed</option>
                </select>

                <label>Location Name:</label>
                <input type="text" placeholder="Enter Location Name" style={{ width: '100%', marginBottom: '1rem' }} />

                <label>Ingredient ID:</label>
                <input type="text" placeholder="Enter Ingredient ID" style={{ width: '100%', marginBottom: '1rem' }} />

                <label>Shipment Received Date:</label>
                <input type="date" style={{ width: '100%', marginBottom: '1rem' }} />

                <label>Cost of Units:</label>
                <input type="number" placeholder="Enter Cost per Unit" style={{ width: '100%', marginBottom: '1rem' }} />

                <label>Quantity Resupply:</label>
                <input type="number" placeholder="Enter Quantity" style={{ width: '100%', marginBottom: '1rem' }} />

                <button disabled style={{ width: '100%', backgroundColor: '#444' }}>
                  Save Inventory Order (inactive)
                </button>
              </div>
            )}

            {managementView === 'none' && (
              <p style={{ color: '#888', textAlign: 'center' }}>Select an option above to manage.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Employee_Manager;
