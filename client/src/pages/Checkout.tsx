import React, { useState, useEffect } from 'react';
import { useShoppingCart } from './../contexts/ShoppingCart'
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../utils/fetchOrder';
import { useWelcomePage } from '../contexts/WelcomePageContext';
import { useToaster } from '../contexts/ToastContext'; 
import { useAuth } from '../contexts/AuthContext';
import type { Customer } from '../contexts/AuthContext';
import { fetchPickupLocations } from '../utils/pickupLoc';

const ShoppingCart: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="9" cy="21" r="1.5" />
    <circle cx="20" cy="21" r="1.5" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const Trash: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);

const ArrowLeft: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

import './Checkout.css'

// Define the shape of the Form Data
interface FormData {
  pickupTime: string;
  pickupLocation: string;
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
        X
      </button>
    </div>
  );
};

export default function FoodTruckCheckout() {
  //const customer = 
  const navigate = useNavigate();
  const { items, total: cartTotal, tax, grandTotal, adjustQuantity, clearCart, removeItem } = useShoppingCart();
  const { pageData } = useWelcomePage();
  const { addToast } = useToaster();

  const { user } = useAuth();

  console.log('Items in cart:', items);
  console.log('First item:', Object.values(items)[0]);
  const [formData, setFormData] = useState<FormData>({
    pickupTime: '',
    pickupLocation: '',
    notes: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    zipcode: '',
    cardName: ''
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showError, setShowError] = useState('');
  const [pickupLocations, setPickupLocations] = useState<any[]>([]);

  // Fetch pickup locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await fetchPickupLocations();
        setPickupLocations(data.locations || []);
      } catch (error) {
        console.error('Failed to fetch pickup locations:', error);
      }
    };
    loadLocations();
  }, []);

  // --- Branding Constants ---
  const TRUCK_NAME = pageData?.FoodTruckName || 'FOOD TRUCK NAME';
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


  const nameStyle: React.CSSProperties = {
    fontSize: '1.6em',
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Inter, sans-serif',
  };
  // -------------------------

  // total price calculation

  // collects inputs to form with formatting logic
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
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

   const handlePlaceOrder = async (): Promise<void> => {
    // Check busy status before submitting order
  try {
    const response = await fetch('/api/busy-status');
    const data = await response.json();
   
    if (data.success && data.isBusy) {
      // Show warning popup
      addToast(
        `⚠️ We're busy! We have ${data.pendingCount} pending orders. Your order may take longer than usual.`,
        "warning"
      );
    }
  } catch (error) {
    console.error('Error checking busy status:', error);
    // Continue anyway if check fails
  }
    // Validate form first
    if (
      formData.cardNumber.replace(/\s/g, '').length === 16 &&
      formData.cardExpiry.length === 5 &&
      formData.cardCVC.length >= 3 &&
      formData.cardName
    ) {
      try {
        // Prepare cart items
        const itemsArray = Object.values(items).map(item => ({
          id: item.MenuItemID,
          price: item.Price,
          customizations: item.customizations,
          quantity: item.quantity
        }));


        const payload = {
          userId: 1, // replace with real user id if available
          orderItems: itemsArray,
          total: grandTotal,
          formData
        };


        console.log(payload);


        try {
          const data = await createOrder(payload);
          console.log(data)
          setOrderPlaced(true);
          setShowError('');
          clearCart();
        } catch (err: any) {
          addToast(err.message || 'Something went wrong. Try again.', "error");
        }


      } catch (err: any) {
        console.error(err);
        addToast('Unable to connect to server.', "error");
      }


    } else {
      addToast('Please check all required (*) fields and card details are complete.', "error");
    }
  };


  // Success Confirmation Screen
  if (orderPlaced) {
    return (
      <div
        className="order-success-container"
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
        <div className="order-success-card" style={{
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
          }}>Your food will be ready for pickup</p>
          
          <button
            onClick={() => { setOrderPlaced(false); clearCart(); }}
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
        <span style={nameStyle}>
          {TRUCK_NAME}
        </span>
      </header>

      {/* Error Notification */}
      {showError && <ErrorNotification message={showError} onClose={() => setShowError('')} />}

      {/* Main Content Area */}
      <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Back Button - Fixed Top Left */}
        <button
          onClick={() => navigate('/menu')}
          style={{
            position: 'fixed',
            top: '90px',
            left: '16px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            color: '#374151',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.transform = 'translateX(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
          Back
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}><ShoppingCart style={{ width: '24px', height: '24px' }} />   Checkout</h1>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px'
        }}>

          {/* Right Column - Customer Info & Payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              }}>Pickup Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Pickup Location */}
                <div>
                  <label htmlFor="pickupLocation" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>Pickup Location <span style={{ color: '#ef4444' }}>*</span></label>
                  {pickupLocations.length === 0 ? (
                    <div style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #fbbf24',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      boxSizing: 'border-box'
                    }}>
                      ⚠️ No pickup locations available today. The food truck is not operating. Please check back another day.
                    </div>
                  ) : (
                    <select
                      id="pickupLocation"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">{pickupLocations.length === 0 ? 'No Locations Available' : 'Select a location'}</option>
                      {pickupLocations && pickupLocations.map((location) => (
                        <option key={location.LocationName} value={location.LocationName}>
                          {location.LocationName} - {location.Address}
                        </option>
                      ))}
                    </select>
                  )}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
              }}>Your Order ({Object.keys(items).length} items)</h2>
              {Object.keys(items).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '4px' }}>Your cart is empty</p>
                  <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>Add items to place an order!</p>
                  <button
                    onClick={() => navigate('/menu')}
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
                  {Object.values(items).map((item) => (
                    <div key={item.cartItemId} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 0',
                      borderBottom: '1px solid #f3f4f6'
                    }}>
                      <img src={item.ImageURL} alt={item.Name} style={{ maxWidth: '80px', maxHeight: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 600, color: '#1f2937', margin: 0, marginBottom: '4px' }}>{item.Name}</h3>
                        <p style={{
                          fontWeight: 500,
                          fontSize: '14px',
                          color: COLOR2,
                          margin: 0,
                          marginBottom: item.customizations && item.customizations.length > 0 ? '8px' : 0
                        }}>
                          ${item.adjustedPrice ? item.adjustedPrice.toFixed(2) : parseFloat(item.Price).toFixed(2)} / ea
                          {item.adjustedPrice && item.adjustedPrice !== parseFloat(item.Price) && (
                            <span style={{
                              textDecoration: 'line-through',
                              marginLeft: '8px',
                              color: '#9ca3af',
                              fontSize: '12px'
                            }}>
                              ${parseFloat(item.Price).toFixed(2)}
                            </span>
                          )}
                        </p>
                        {item.customizations && item.customizations.length > 0 && (
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                            marginTop: '6px'
                          }}>
                            {item.customizations.map((custom, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '11px',
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  fontWeight: 500,
                                  backgroundColor:
                                    custom.changeType === 'removed' ? '#fee2e2' :
                                      custom.changeType === 'substituted' ? '#dbeafe' : '#d1fae5',
                                  color:
                                    custom.changeType === 'removed' ? '#991b1b' :
                                      custom.changeType === 'substituted' ? '#1e40af' : '#065f46',
                                  border: `1px solid ${custom.changeType === 'removed' ? '#fca5a5' :
                                    custom.changeType === 'substituted' ? '#93c5fd' : '#6ee7b7'
                                    }`
                                }}
                              >
                                {custom.changeType === 'removed' && '− '}
                                {custom.changeType === 'substituted' && '↔ '}
                                {custom.changeType === 'added' && '+ '}
                                {custom.ingredientName}
                                {custom.quantityDelta > 1 && ` (×${custom.quantityDelta})`}
                                {custom.priceAdjustment > 0 && custom.changeType !== 'removed' &&
                                  ` (+$${custom.priceAdjustment.toFixed(2)})`
                                }
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <button
                          onClick={() => adjustQuantity(item.cartItemId, -1)}
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
                          onClick={() => {
                            console.log("clicked");

                            adjustQuantity(item.cartItemId, 1)
                          }}
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
                        ${((item.adjustedPrice || parseFloat(item.Price)) * item.quantity).toFixed(2)}
                      </div>

                      <button
                        onClick={() => removeItem(item.cartItemId)}
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
                        aria-label={`Remove ${item.Name}`}
                      >
                        <Trash style={{ width: '20px', height: '20px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary & Final Button */}
            {Object.keys(items).length > 0 && (
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
                    fontWeight: 650,
                    color: '#1f2937'
                  }}>
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    fontSize: '24px',
                    fontWeight: 650,
                    color: '#1f2937'
                  }}>
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    fontSize: '24px',
                    fontWeight: 650,
                    color: '#1f2937'
                  }}>
                    <span>Grand Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={pickupLocations.length === 0}
                  style={{
                    width: '100%',
                    color: 'white',
                    backgroundColor: pickupLocations.length === 0 ? '#9ca3af' : COLOR1,
                    marginTop: '32px',
                    padding: '16px',
                    borderRadius: '12px',
                    fontWeight: 650,
                    fontSize: '20px',
                    border: 'none',
                    cursor: pickupLocations.length === 0 ? 'not-allowed' : 'pointer',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s',
                    opacity: pickupLocations.length === 0 ? 0.6 : 1
                  }}
                  onMouseOver={(e) => {
                    if (pickupLocations.length > 0) {
                      e.currentTarget.style.backgroundColor = '#6b0fd4';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (pickupLocations.length > 0) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    }
                  }}
                >
                  {pickupLocations.length === 0 
                    ? 'Not Available Today' 
                    : `Pay & Place Order - $${grandTotal.toFixed(2)}`}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
} 