import React, { useState, useEffect } from 'react';
import '../index.css';

const Employee_Manager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'menu' | 'management'>('menu');
  const [available, setAvailable] = useState(true);
  const [managementView, setManagementView] = useState<'none' | 'utilities' | 'inventory'>('none');

  // ---------------- MENU ITEM FORM ----------------
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // ---------------- UTILITIES FORM ----------------
  const [paymentId, setPaymentId] = useState('');
  const [utilityType, setUtilityType] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [utilityDate, setUtilityDate] = useState('');
  const [utilityLocation, setUtilityLocation] = useState('');
  const [utilitiesList, setUtilitiesList] = useState<any[]>([]);

  // ---------------- INVENTORY FORM ----------------
  const [supplierName, setSupplierName] = useState('');
  const [status, setStatus] = useState('');
  const [locationName, setLocationName] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [showIngredients, setShowIngredients] = useState(false);
  const [receivedDate, setReceivedDate] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [inventoryList, setInventoryList] = useState<any[]>([]);

  const ingredients = [
    { name: 'Example French Toast', cost: 1.0 },
    { name: 'Example item1', cost: 1.0 },
    { name: 'Example Avocado', cost: 1.0 },
    { name: 'Example Fruit', cost: 1.0 },
    { name: 'Example meat', cost: 1.0 },
  ];

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    fetch('/api/utilities')
      .then(res => res.json())
      .then(data => {setUtilitiesList(data), console.log('✅ Utilities fetch response:', data);})
      .catch(err => console.error('❌ Utilities fetch error:', err));

    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => setInventoryList(data))
      .catch(err => console.error('❌ Inventory fetch error:', err));
  }, []);

  // ---------------- MENU ITEM SAVE ----------------
  const isFormValid = Boolean(
    itemName.trim() &&
      itemDescription.trim() &&
      parseFloat(itemPrice) > 0 &&
      category.trim() &&
      parseInt(stock) >= 0
  );

  const handleSave = async () => {
    if (!isFormValid) return;
    setIsSaving(true);
    setSaveMessage('');

    const newItem = {
      name: itemName,
      description: itemDescription,
      price: parseFloat(itemPrice),
      category,
      stock: parseInt(stock),
      available,
    };

    try {
      const res = await fetch('/api/menuItems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      console.log('✅ Saved menu item:', data);
      setSaveMessage('✔ Menu item saved successfully!');
      setItemName('');
      setItemDescription('');
      setItemPrice('');
      setCategory('');
      setStock('');
    } catch (err) {
      console.error('❌ Error saving item:', err);
      setSaveMessage('❌ Failed to save item. Check console.');
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------- UTILITIES SAVE ----------------
  const handleSaveUtilityPayment = async () => {
    try {
      const payload = {
        paymentId,
        type: utilityType,
        totalAmount: parseFloat(totalAmount),
        date: utilityDate,
        locationName: utilityLocation,
      };

      const res = await fetch('/api/utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      console.log('✅ Utility payment saved:', data);
      alert('Utility payment saved successfully!');

      setPaymentId('');
      setUtilityType('');
      setTotalAmount('');
      setUtilityDate('');
      setUtilityLocation('');

      const refreshed = await fetch('/api/utilities');
      const updatedList = await refreshed.json();
      setUtilitiesList(updatedList);
    } catch (err) {
      console.error('❌ Error saving utility payment:', err);
      alert('Failed to save utility payment. Check console.');
    }
  };

  // ---------------- INVENTORY SAVE ----------------
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

      const refreshed = await fetch('/api/inventory');
      const updatedList = await refreshed.json();
      setInventoryList(updatedList);
    } catch (err) {
      console.error('❌ Error saving inventory order:', err);
      alert('Failed to save inventory order. Check console.');
    }
  };

  // ---------------- COMPONENT UI ----------------
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

      {/* -------------------- MENU TAB -------------------- */}
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
          <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />

          <label>Item Description:</label>
          <textarea value={itemDescription} onChange={e => setItemDescription(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />

          <label>Item Price:</label>
          <input type="number" value={itemPrice} onChange={e => setItemPrice(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />

          <label>Category:</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }}>
            <option value="">Select category</option>
            <option value="food">Food</option>
            <option value="drink">Drink</option>
            <option value="dessert">Dessert</option>
          </select>

          <label>Remaining Stock:</label>
          <input type="number" value={stock} onChange={e => setStock(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ marginRight: '10px' }}>Available:</label>
            <input type="checkbox" checked={available} onChange={() => setAvailable(!available)} style={{ transform: 'scale(1.2)' }} />
            <span style={{ marginLeft: '8px' }}>{available ? 'Available' : 'Sold Out'}</span>
          </div>

          <button
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            style={{
              width: '100%',
              backgroundColor: isFormValid ? 'green' : '#444',
              color: 'white',
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>

          {saveMessage && (
            <p style={{ color: saveMessage.includes('✔') ? 'lightgreen' : 'red', marginTop: '1rem', textAlign: 'center' }}>
              {saveMessage}
            </p>
          )}
        </div>
      )}

      {/* -------------------- MANAGEMENT TAB -------------------- */}
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

          <div style={{ marginTop: '2rem', background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', textAlign: 'left' }}>
            {/* ---------------- UTILITIES FORM ---------------- */}
            {managementView === 'utilities' && (
              <div>
                <h3 style={{ textAlign: 'center' }}>Add Utilities Payments</h3>
                <label>Payment ID:</label>
                <input type="text" value={paymentId} onChange={e => setPaymentId(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />
                <label>Type:</label>
                <select value={utilityType} onChange={e => setUtilityType(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }}>
                  <option value="">Select Type</option>
                  <option value="water">Water</option>
                  <option value="electricity">Electricity</option>
                  <option value="gas">Gas</option>
                  <option value="internet">Internet</option>
                  <option value="phone">Phone</option>
                  <option value="other">Other</option>
                </select>
                <label>Location:</label>
                <input
                  type="text"
                  value={utilityLocation}
                  onChange={e => setUtilityLocation(e.target.value)}
                  style={{ width: '100%', marginBottom: '1rem' }}
                />
                <label>Total Amount:</label>
                <input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />
                <label>Date:</label>
                <input type="date" value={utilityDate} onChange={e => setUtilityDate(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />
                <button onClick={handleSaveUtilityPayment} style={{ width: '100%' }}>
                  Save Utility Payment
                </button>

                {/* Display saved utilities */}
                {utilitiesList.length > 0 && (
                  <div style={{ marginTop: '2rem' }}>
                    <h4 style={{ textAlign: 'center' }}>Saved Utility Payments</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                      <thead>
                        <tr style={{ background: '#333', color: '#fff' }}>
                          <th>Payment ID</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Location</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {utilitiesList.map((u, i) => (
                          <tr key={i} style={{ textAlign: 'center' }}>
                            <td>{u.paymentId}</td>
                            <td>{u.type}</td>
                            <td>${u.amount}</td>
                            <td>{u.locationName ?? '—'}</td>
                            <td>{u.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- INVENTORY FORM ---------------- */}
            {managementView === 'inventory' && (
              <div>
                <h3 style={{ textAlign: 'center' }}>Create Inventory Order</h3>
                <label>Supplier Name:</label>
                <input type="text" value={supplierName} onChange={e => setSupplierName(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />

                <label>Status:</label>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }}>
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="received">Received</option>
                  <option value="delayed">Delayed</option>
                </select>

                <label>Location Name:</label>
                <input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />

                <label>Ingredient Item:</label>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Select Ingredient"
                    value={selectedIngredient}
                    onClick={() => setShowIngredients(!showIngredients)}
                    readOnly
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  {showIngredients && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: '100%',
                        background: '#333',
                        border: '1px solid #555',
                        borderRadius: '6px',
                        zIndex: 10,
                        padding: '0.5rem',
                      }}
                    >
                      {ingredients.map((item, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setSelectedIngredient(item.name);
                            setShowIngredients(false);
                          }}
                          style={{
                            padding: '0.5rem',
                            borderBottom: i < ingredients.length - 1 ? '1px solid #444' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{item.name}</span>
                          <span style={{ color: '#aaa' }}>+${item.cost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <label>Shipment Received Date:</label>
                <input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />

                <label>Cost per Unit:</label>
                <input type="number" value={costPerUnit} onChange={e => setCostPerUnit(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />

                <label>Quantity Resupply:</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />

                <button onClick={handleSaveInventoryOrder} style={{ width: '100%' }}>
                  Save Inventory Order
                </button>

                {/* Display saved inventory orders */}
                {inventoryList.length > 0 && (
                  <div style={{ marginTop: '2rem' }}>
                    <h4 style={{ textAlign: 'center' }}>Saved Inventory Orders</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                      <thead>
                        <tr style={{ background: '#333', color: '#fff' }}>
                          <th>Supplier</th>
                          <th>Status</th>
                          <th>Location</th>
                          <th>Item</th>
                          <th>Cost</th>
                          <th>Qty</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryList.map((o, i) => (
                          <tr key={i} style={{ textAlign: 'center' }}>
                            <td>{o.supplierName}</td>
                            <td>{o.status}</td>
                            <td>{o.locationName}</td>
                            <td>{o.ingredientItem}</td>
                            <td>${o.costPerUnit}</td>
                            <td>{o.quantity}</td>
                            <td>{o.receivedDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
