import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TopNav } from '../components/TopNav';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToaster } from '../contexts/ToastContext';
import './EmployeeOrders.css';

interface OrderItem {
  orderItemID: number;
  menuItemID: number;
  menuItemName: string;
  quantity: number;
  price: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  customizations?: OrderItemCustomization[];
}

interface OrderItemCustomization {
  ingredientName: string;
  changeType: 'add' | 'remove' | 'substitute';
  quantityDelta: number;
  note?: string;
}

interface Order {
  orderId: number;
  customerId?: number;
  customerName?: string;
  locationName: string;
  orderDate: string;
  wasPlacedOnline: boolean;
  paymentMethod: 'cash' | 'card';
  totalAmount: number;
  items: OrderItem[];
  overallStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
}

type TabType = 'live' | 'past';

export const EmployeeOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const { addToast } = useToaster();
  const [activeTab, setActiveTab] = useState<TabType>('live');
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsLoaded(true);
    });

    const poll = setInterval(() => {
      fetchOrders();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    if (userType !== 'employee' && userType !== 'manager') {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [user, userType, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch live orders (pending + in_progress)
      const liveResponse = await fetch('/api/orders/live');
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        setLiveOrders(liveData);
      }

      // Fetch past orders (completed + cancelled + refunded)
      const pastResponse = await fetch('/api/orders/past');
      if (pastResponse.ok) {
        const pastData = await pastResponse.json();
        setPastOrders(pastData);
      }
    } catch (err) {
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      // Get staff ID from authenticated user
      const staffId = user && 'StaffID' in user ? user.StaffID : null;
      
      const response = await fetch(`/api/orders/${orderId}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId })
      });

      if (!response.ok) throw new Error('Failed to accept order');

      addToast('Order accepted successfully', 'success');
      fetchOrders();
    } catch (err) {
      addToast('Failed to accept order', 'error');
    }
  };

  const handleMarkItemDone = async (orderItemId: number) => {
    try {
      const response = await fetch(`/api/order-items/${orderItemId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });

      if (!response.ok) throw new Error('Failed to update item status');

      addToast('Item marked as completed', 'success');
      fetchOrders();
    } catch (err) {
      addToast('Failed to update item status', 'error');
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to complete order');

      addToast('Order completed successfully', 'success');
      fetchOrders();
    } catch (err) {
      addToast('Failed to complete order', 'error');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to cancel order');

      addToast('Order cancelled successfully', 'success');
      fetchOrders();
    } catch (err) {
      addToast('Failed to cancel order', 'error');
    }
  };

  const handleSearchPastOrders = async () => {
    if (!startDate || !endDate) {
      addToast('Please select both start and end dates', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/orders/past?startDate=${startDate}&endDate=${endDate}`);
      if (response.ok) {
        const data = await response.json();
        setPastOrders(data);
      }
    } catch (err) {
      addToast('Failed to search orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'refunded': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'in_progress': return '🔄';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      case 'refunded': return '💰';
      default: return '❓';
    }
  };

  const renderReceiptCard = (order: Order) => {
    const canAccept = order.overallStatus === 'pending';
    const canComplete = order.overallStatus === 'in_progress' && order.items.every(item => item.status === 'completed');

    return (
      <div key={order.orderId} className="receipt-card">
        <div className="receipt-header" style={{ background: getStatusColor(order.overallStatus) }}>
          <div className="receipt-status-indicator">
            {getStatusIcon(order.overallStatus)} {order.overallStatus.replace('_', ' ').toUpperCase()}
          </div>
          <div className="receipt-title">ORDER #{order.orderId}</div>
          <div className="receipt-date">{formatDate(order.orderDate)}</div>
        </div>

        <div className="receipt-separator"></div>

        <div className="receipt-info">
          <div className="receipt-info-row">
            <span className="info-label">Customer:</span>
            <span className="info-value">{order.customerName || 'Guest'}</span>
          </div>
          <div className="receipt-info-row">
            <span className="info-label">Location:</span>
            <span className="info-value">{order.locationName}</span>
          </div>
          <div className="receipt-info-row">
            <span className="info-label">Payment:</span>
            <span className="info-value">{order.paymentMethod.toUpperCase()}</span>
          </div>
        </div>

        <div className="receipt-separator"></div>

        <div className="receipt-items">
          {order.items.map((item) => (
            <div key={item.orderItemID} className="receipt-item">
              <div className="receipt-item-header">
                <span className="receipt-item-name">
                  {item.quantity}x {item.menuItemName}
                </span>
                <span className="receipt-item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
              
              <div className="receipt-item-status">
                <span className="status-badge" style={{ background: getStatusColor(item.status) }}>
                  {getStatusIcon(item.status)} {item.status.replace('_', ' ')}
                </span>
                {item.status !== 'completed' && item.status !== 'pending' && (
                  <button
                    className="receipt-mark-done-btn"
                    onClick={() => handleMarkItemDone(item.orderItemID)}
                  >
                    ✓ Mark Done
                  </button>
                )}
              </div>

              {item.customizations && item.customizations.length > 0 && (
                <div className="receipt-customizations">
                  {item.customizations.map((custom, idx) => (
                    <div key={idx} className="receipt-custom-item">
                      <span className="custom-icon">
                        {custom.changeType === 'add' ? '+' : custom.changeType === 'remove' ? '-' : '~'}
                      </span>
                      <span className="custom-text">
                        {custom.changeType} {custom.ingredientName}
                        {custom.quantityDelta !== 1 && ` (×${custom.quantityDelta})`}
                      </span>
                    </div>
                  ))}
                  {item.customizations.some(c => c.note) && (
                    <div className="receipt-custom-note">
                      Note: {item.customizations.find(c => c.note)?.note}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="receipt-separator"></div>

        <div className="receipt-total">
          <span className="total-label">TOTAL</span>
          <span className="total-amount">${order.totalAmount.toFixed(2)}</span>
        </div>

        <div className="receipt-actions">
          {canAccept && (
            <>
              <button className="receipt-accept-btn" onClick={() => handleAcceptOrder(order.orderId)}>
                ✓ Accept Order
              </button>
              <button className="receipt-cancel-btn" onClick={() => handleCancelOrder(order.orderId)}>
                ✕ Cancel Order
              </button>
            </>
          )}
          {canComplete && (
            <button className="receipt-complete-btn" onClick={() => handleCompleteOrder(order.orderId)}>
              ✓ Complete Order
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderOrderCard = (order: Order, isLive: boolean) => {
    const isExpanded = expandedOrder === order.orderId;
    const canAccept = order.overallStatus === 'pending';
    const canComplete = order.overallStatus === 'in_progress' && order.items.every(item => item.status === 'completed');

    return (
      <div key={order.orderId} className={`order-card ${order.overallStatus}`}>
        <div className="order-card-header" onClick={() => setExpandedOrder(isExpanded ? null : order.orderId)}>
          <div className="order-info">
            <div className="order-id">
              <span className="order-label">Order #</span>
              <span className="order-number">{order.orderId}</span>
            </div>
            <div className="order-meta">
              <span className="order-date">📅 {formatDate(order.orderDate)}</span>
              <span className="order-location">📍 {order.locationName}</span>
              {order.customerName && (
                <span className="customer-name">👤 {order.customerName}</span>
              )}
            </div>
          </div>
          <div className="order-summary">
            <div className="order-status" style={{ background: getStatusColor(order.overallStatus) }}>
              {getStatusIcon(order.overallStatus)} {order.overallStatus.replace('_', ' ')}
            </div>
            <div className="order-total">${order.totalAmount.toFixed(2)}</div>
            <button className="expand-button">
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="order-card-body">
            <div className="order-items">
              <h4>Order Items</h4>
              {order.items.map((item) => (
                <div key={item.orderItemID} className="order-item">
                  <div className="item-info">
                    <div className="item-header">
                      <span className="item-name">{item.menuItemName}</span>
                      <span className="item-quantity">×{item.quantity}</span>
                      <span className="item-price">${item.price.toFixed(2)}</span>
                    </div>
                    <div className="item-status" style={{ color: getStatusColor(item.status) }}>
                      {getStatusIcon(item.status)} {item.status.replace('_', ' ')}
                    </div>
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="item-customizations">
                        <strong>Customizations:</strong>
                        {item.customizations.map((custom, idx) => (
                          <div key={idx} className="customization">
                            • {custom.changeType} {custom.ingredientName}
                            {custom.quantityDelta !== 1 && ` (×${custom.quantityDelta})`}
                            {custom.note && ` - ${custom.note}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {isLive && item.status !== 'completed' && (
                    <button
                      className="mark-done-btn"
                      onClick={() => handleMarkItemDone(item.orderItemID)}
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="order-actions">
              {isLive && canAccept && (
                <button className="accept-btn" onClick={() => handleAcceptOrder(order.orderId)}>
                  Accept Order
                </button>
              )}
              {isLive && canComplete && (
                <button className="complete-btn" onClick={() => handleCompleteOrder(order.orderId)}>
                  Complete Order
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading && liveOrders.length === 0 && pastOrders.length === 0) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  return (
    <div className={`employee-orders-container ${isLoaded ? 'loaded' : ''}`}>
      <TopNav />

      <div className="employee-orders-content">
        <header className="employee-orders-header">
          <button className="back-button" onClick={() => navigate('/employee')}>
            ← Back to Dashboard
          </button>
          <h1 className="employee-orders-title">
            <span className="gradient-text">Order Management</span>
          </h1>
          <p className="employee-orders-subtitle">
            <span className="subtitle-icon">📋</span>
            View and process customer orders
          </p>
        </header>

        <div className="tabs-container">
          <button
            className={`tab ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            🔴 Live Orders
            {liveOrders.length > 0 && <span className="tab-badge">{liveOrders.length}</span>}
          </button>
          <button
            className={`tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            📜 Past Orders
          </button>
        </div>

        {activeTab === 'live' ? (
          <div className="orders-list">
            {liveOrders.length === 0 ? (
              <div className="no-orders-message">
                <span className="no-orders-icon">🎉</span>
                <h3>No Active Orders</h3>
                <p>All caught up! No pending or in-progress orders at the moment.</p>
              </div>
            ) : (
              <>
                <div className="orders-header">
                  <h3>Active Orders ({liveOrders.length})</h3>
                  <button className="refresh-btn" onClick={fetchOrders}>
                    🔄 Refresh
                  </button>
                </div>
                <div className="receipt-grid">
                  {liveOrders.map(order => renderReceiptCard(order))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="orders-list">
            <div className="search-controls">
              <div className="date-inputs">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                />
                <button className="search-btn" onClick={handleSearchPastOrders}>
                  🔍 Search
                </button>
              </div>
            </div>

            {pastOrders.length === 0 ? (
              <div className="no-orders-message">
                <span className="no-orders-icon">📭</span>
                <h3>No Past Orders</h3>
                <p>No completed, cancelled, or refunded orders found.</p>
              </div>
            ) : (
              <>
                <div className="orders-header">
                  <h3>Past Orders ({pastOrders.length})</h3>
                </div>
                {pastOrders.map(order => renderOrderCard(order, false))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
