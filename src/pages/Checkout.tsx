import React, { useState } from 'react';
import { ShoppingCart, Trash, X } from 'lucide-react';

import './Checkout.css'

// Define the shape of a Cart Item for TypeScript
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Define the shape of the Form Data
interface FormData {
  name: string;
  email: string;
  phone: string;
  pickupTime: string;
  notes: string;
  cardNumber: string;
  cardExpiry: string;
  zipcode: string;
  cardCVC: string;
  cardName: string;
}

// Custom Error Notification Component
const ErrorNotification: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  return (
    <div 
      style={{ 
        position: 'fixed',
        top: '8px',
        right: '16px',
        zIndex: 50,
        padding: '16px',
        color: 'white',
        backgroundColor: 'var(--color-red)',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        maxWidth: '24rem'
      }}
    >
      <div style={{ flex: 1, fontWeight: 500 }}>{message}</div>
      <button 
        onClick={onClose} 
        style={{
          padding: '4px',
          borderRadius: '9999px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <X style={{ width: '20px', height: '20px' }} />
      </button>
    </div>
  );
};

export default function FoodTruckCheckout() {
  const [cart, setCart] = useState<CartItem[]>([
    { id: 1, name: 'Classic Burger', price: 6.99, quantity: 1, image: '🍔' },
    { id: 2, name: 'Fries', price: 2.99, quantity: 2, image: '🍟' }
  ]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '', 
    phone: '',
    pickupTime: '',
    notes: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    zipcode: '',
    cardName: ''
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showError, setShowError] = useState('');

  // --- Branding Constants ---
  const TRUCK_NAME = 'FOOD TRUCK NAME'; 
  const LOGO_TEXT = 'LOGO';
  // -------------------------

  // --- Styles (CSS Variables) ---
  const COLOR1 = 'var(--color-primary)';
  const COLOR2 = 'var(--color-secondary)';
  const COLOR3 = 'var(--color-light)'; 
  const GRADIENT_START = 'var(--gradient-start)'; 
  const GRADIENT_END = 'var(--gradient-end)';  

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 20px', 
    backgroundColor: '#fff', 
    borderBottom: '1px solid #ddd',
    position: 'sticky',
    top: 0,
    zIndex: 20,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '45px', 
    width: '45px',
    marginRight: '15px',
    borderRadius: '50%',
    backgroundColor: COLOR1,
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: '1.2em',
    flexShrink: 0,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const nameStyle: React.CSSProperties = {
    fontSize: '1.6em',
    fontWeight: '700', 
    color: '#333', 
    fontFamily: 'Inter, sans-serif',
  };
  // -------------------------

  // update item quantity
  const updateQuantity = (id: number, add: number): void => {
    const updatedCart = cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + add;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter((item): item is CartItem => item !== null);

    setCart(updatedCart);
  };

  // remove item
  const removeItem = (id: number): void => {
    setCart(cart.filter(item => item.id !== id));
  };

  // total price calculation
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // collects inputs to form with formatting logic
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'cardNumber') {
      const digits = value.replace(/\D/g, '').substring(0, 16);
      newValue = digits.match(/.{1,4}/g)?.join(' ') || '';
    }

    if (name === 'cardExpiry') {
      const digits = value.replace(/\D/g, '').substring(0, 4);
      
      if (digits.length > 2) {
        newValue = `${digits.substring(0, 2)}/${digits.substring(2)}`;
      } else {
        newValue = digits;
      }
    }

    setFormData({ ...formData, [name]: newValue });
  };

  // check if info is entered before order placement
  const handlePlaceOrder = (): void => {
    if (
      formData.name && 
      (formData.email || formData.phone) && 
      formData.cardNumber.replace(/\s/g, '').length === 16 &&
      formData.cardExpiry.length === 5 &&
      formData.cardCVC.length >= 3 &&
      formData.cardName
    ) {
      setOrderPlaced(true);
      setShowError('');
    } else {
      setShowError('Please check all required (*) fields and card details are complete.');
    }
  };

  // Success Confirmation Screen
  if (orderPlaced) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: `linear-gradient(to bottom right, ${GRADIENT_START}, ${GRADIENT_END})`
        }}
      >
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '32px',
          maxWidth: '28rem',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#dcfce7',
            color: 'var(--color-green)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '48px',
            fontWeight: 'bold'
          }}>
            ✓
          </div>
          <h2 style={{
            fontSize: '30px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px'
          }}>Order Confirmed!</h2>
          <p style={{ 
            color: '#4b5563', 
            marginBottom: '24px',
            fontWeight: 500
          }}>Your food will be ready for **pickup in approximately 15 minutes**.</p>
          <div style={{
            width: '100%',
            padding: '16px',
            borderLeft: `4px solid #f97316`,
            backgroundColor: COLOR3,
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <p style={{ fontSize: '14px', color: '#374151' }}>A confirmation will be sent to:</p>
            <p style={{
              fontWeight: 600,
              color: '#1f2937',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>{formData.email || formData.phone || 'Contact information not provided'}</p>
          </div>
          <button 
            onClick={() => { setOrderPlaced(false); setCart([]); }}
            style={{
              width: '100%',
              color: 'white',
              backgroundColor: 'var(--color-green)',
              padding: '12px',
              borderRadius: '12px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-green)'}
          >
            <ShoppingCart style={{ width: '20px', height: '20px' }}/>
            Start New Order
          </button>
        </div>
      </div>
    );
  }

  // Main Checkout Screen
  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: COLOR3
    }}>
      
      {/* STICKY HEADER/LOGO SECTION */}
      <header style={headerStyle}>
        <span style={logoStyle}>
          {LOGO_TEXT}
        </span>
        <span style={nameStyle}>
          {TRUCK_NAME}
        </span>
      </header>

      {/* Error Notification */}
      {showError && <ErrorNotification message={showError} onClose={() => setShowError('')} />}

      {/* Main Content Area */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <ShoppingCart style={{ width: '32px', height: '32px', color: COLOR1 }} />
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Checkout</h1>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px'
        }}>
          
          {/* Right Column - Customer Info & Payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Contact Information */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '16px',
                marginTop: 0
              }}>Contact & Pickup</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Name */}
                <div>
                  <label htmlFor="name" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>Email <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                {/* Phone */}
                <div>
                  <label htmlFor="phone" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>Phone</label>
                  <input 
                    type="tel" 
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                {/* Pickup Time */}
                <div>
                  <label htmlFor="pickupTime" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>Preferred Pickup Time</label>
                  <input 
                    type="time" 
                    id="pickupTime"
                    name="pickupTime"
                    value={formData.pickupTime}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0
                }}>Payment Information</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Name on Card */}
                <div>
                  <label htmlFor="cardName" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>Name on Card <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="text" 
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Card Number */}
                <div>
                  <label htmlFor="cardNumber" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>Card Number <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="text" 
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="XXXX XXXX XXXX XXXX"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    maxLength={19}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Expiry Date */}
                  <div>
                    <label htmlFor="cardExpiry" style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '8px'
                    }}>Expiry Date <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="text" 
                      id="cardExpiry"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  {/* CVC */}
                  <div>
                    <label htmlFor="cardCVC" style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '8px'
                    }}>CVC <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="text" 
                      id="cardCVC"
                      name="cardCVC"
                      value={formData.cardCVC}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={3}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  {/* Zip Code */}
                <div>
                  <label htmlFor="zipcode" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>Zip Code <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="text" 
                    id="zipcode"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleInputChange}
                    maxLength={5}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Column - Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '16px',
                marginTop: 0,
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '12px'
              }}>Your Order ({cart.length} items)</h2>
              
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '4px' }}>Your cart is empty</p>
                  <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>Add items to place an order!</p>
                  <button 
                    style={{
                      marginTop: '24px',
                      color: 'white',
                      backgroundColor: 'var(--color-primary)',
                      padding: '8px 24px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 0',
                      borderBottom: '1px solid #f3f4f6'
                    }}>
                      <div style={{ fontSize: '30px', flexShrink: 0 }}>{item.image}</div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 600, color: '#1f2937', margin: 0, marginBottom: '4px' }}>{item.name}</h3>
                        <p style={{ 
                          fontWeight: 500, 
                          fontSize: '14px', 
                          color: COLOR2,
                          margin: 0
                        }}>${item.price.toFixed(2)} / ea</p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#4b5563'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        >
                        -
                        </button>
                        <span style={{ 
                          width: '24px', 
                          textAlign: 'center', 
                          fontWeight: 'bold', 
                          color: '#1f2937' 
                        }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#4b5563'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ 
                        fontWeight: 600, 
                        color: '#374151', 
                        width: '64px', 
                        textAlign: 'right', 
                        flexShrink: 0 
                      }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.id)}
                        style={{
                          color: '#ef4444',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '50%',
                          transition: 'all 0.2s',
                          flexShrink: 0
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.color = '#dc2626';
                          e.currentTarget.style.backgroundColor = '#fee2e2';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.color = '#ef4444';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash style={{ width: '20px', height: '20px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary & Final Button */}
            {cart.length > 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                padding: '24px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1f2937',
                  marginBottom: '16px',
                  marginTop: 0,
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '12px'
                }}>Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#1f2937'
                  }}>
                    <span>Grand Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  style={{
                    width: '100%',
                    color: 'white',
                    backgroundColor: COLOR1,
                    marginTop: '32px',
                    padding: '16px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '20px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6b0fd4'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                >
                  Pay & Place Order - ${total .toFixed(2)}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
} 