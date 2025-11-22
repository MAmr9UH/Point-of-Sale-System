import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TopNav } from "../components/TopNav";
import { useToaster } from '../contexts/ToastContext';
import { authenticatedFetch } from '../utils/jwtAuth';
import './Profile.css';

// TypeScript interfaces
interface Customer {
  CustomerID: number;
  Email: string;
  Fname: string;
  Lname: string;
  PhoneNumber: string;
  IncentivePoints: number;
  OptInMarketing: boolean;
}

interface Order {
  OrderID: number;
  OrderDate: string;
  TotalAmount: string;
  PaymentMethod: string;
  LocationName: string;
  Items: string;
  Status: string;
  HasFeedback: boolean;
}

interface MostOrderedItem {
  Name: string;
  ImageURL: string;
  TotalOrdered: number;
}

interface ProfileData {
  success: boolean;
  customer: Customer;
  orders: Order[];
  mostOrderedItem: MostOrderedItem | null;
}

// SVG Icons
const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CustomerProfile: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [editForm, setEditForm] = useState({
    Fname: '',
    Lname: '',
    PhoneNumber: '',
    Email: '',
    OptInMarketing: false
  });

  const { user } = useAuth();
  const { addToast } = useToaster();
  const { updateUser } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const customerId = (user as Customer).CustomerID;
    fetchProfile(customerId);
  }, [user]);

  const fetchProfile = async (customerId: number) => {
    try {
      const response = await authenticatedFetch(`/api/customers/profile/${customerId}`);
      const data = await response.json();
      if (data.success) {
        setProfileData(data);
        setEditForm({
          Fname: data.customer.Fname || '',
          Lname: data.customer.Lname || '',
          PhoneNumber: data.customer.PhoneNumber || '',
          Email: data.customer.Email || '',
          OptInMarketing: data.customer.OptInMarketing || false
        });
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    const customerId = (user as Customer).CustomerID;
    
    try {
      const response = await authenticatedFetch(`/api/customers/profile/${customerId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      
      if (data.success) {
        addToast('Profile updated successfully', 'success');
        setShowEditForm(false);
        
        // Update the auth context with new user data
        const updatedUser: Customer = {
          ...user as Customer,
          Fname: editForm.Fname,
          Lname: editForm.Lname,
          Email: editForm.Email,
          PhoneNumber: editForm.PhoneNumber,
          OptInMarketing: editForm.OptInMarketing
        };
        updateUser(updatedUser);
        
        fetchProfile(customerId);
      } else {
        addToast(data.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      addToast('Failed to update profile', 'error');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!user || !selectedOrder || rating === 0) return;

    const customerId = (user as Customer).CustomerID;

    try {
      const response = await authenticatedFetch('/api/customers/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          orderId: selectedOrder.OrderID,
          rating,
          comments
        })
      });

      const data = await response.json();

      if (data.success) {
        addToast('Feedback submitted successfully', 'success');
        setShowFeedbackModal(false);
        setRating(0);
        setComments('');
        setSelectedOrder(null);
        fetchProfile(customerId);
      } else {
        addToast(data.error || 'Failed to submit feedback', 'error');
      }
    } catch (err) {
      addToast('Failed to submit feedback', 'error');
    }
  };

  const openFeedbackModal = (order: Order) => {
    setSelectedOrder(order);
    setRating(0);
    setComments('');
    setShowFeedbackModal(true);
  };

  if (loading) {
    return (
      <>
        <TopNav />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <TopNav />
        <div className="profile-container">
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <h3 className="empty-title">Authentication Required</h3>
            <p className="empty-message">Please log in to view your profile</p>
          </div>
        </div>
      </>
    );
  }

  if (!profileData) {
    return (
      <>
        <TopNav />
        <div className="profile-container">
          <div className="empty-state">
            <div className="empty-icon">❌</div>
            <h3 className="empty-title">Profile Not Found</h3>
            <p className="empty-message">Unable to load your profile data</p>
          </div>
        </div>
      </>
    );
  }

  const { customer, orders, mostOrderedItem } = profileData;
  const pendingOrders = orders.filter(o => o.Status === 'pending' || o.Status === 'in_progress');
  const completedOrders = orders.filter(o => o.Status === 'completed' || o.Status === 'cancelled' || o.Status === 'refunded');

  return (
    <>
      <TopNav />
      <div className="profile-container">
        <div className="profile-content">
          {/* Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              <UserIcon />
            </div>
            <div className="profile-info">
              <h1 className="profile-name">
                {customer.Fname} {customer.Lname}
              </h1>
              <p className="profile-email">{customer.Email}</p>
              <div className="profile-points">
                <StarIcon style={{ width: '18px', height: '18px' }} />
                <span>{customer.IncentivePoints} Points</span>
              </div>
            </div>
            <button className="edit-profile-btn" onClick={() => setShowEditForm(true)}>
              ✏️ Edit Profile
            </button>
          </div>

          {/* Most Ordered Item */}
          {mostOrderedItem && (
            <div className="favorite-card">
              <h2 className="favorite-title">
                <StarIcon style={{ width: '24px', height: '24px', color: '#FFD700' }} />
                Your Favorite
              </h2>
              <div className="favorite-content">
                <img 
                  src={mostOrderedItem.ImageURL} 
                  alt={mostOrderedItem.Name}
                  className="favorite-image"
                />
                <div>
                  <h3 className="favorite-name">{mostOrderedItem.Name}</h3>
                  <p className="favorite-count">Ordered {mostOrderedItem.TotalOrdered} times</p>
                </div>
              </div>
            </div>
          )}

          {/* Orders Section */}
          <div className="orders-section">
            <div className="orders-tabs">
              <button
                className={`orders-tab ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                🔴 Active Orders
                {pendingOrders.length > 0 && (
                  <span className="tab-badge">{pendingOrders.length}</span>
                )}
              </button>
              <button
                className={`orders-tab ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                📜 Order History
              </button>
            </div>

            {activeTab === 'pending' ? (
              <div className="orders-list">
                {pendingOrders.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🎉</div>
                    <h3 className="empty-title">No Active Orders</h3>
                    <p className="empty-message">All caught up! No pending orders at the moment.</p>
                  </div>
                ) : (
                  pendingOrders.map((order) => (
                    <div key={order.OrderID} className={`order-card ${order.Status}`}>
                      <div className="order-header">
                        <div>
                          <div className="order-id">Order #{order.OrderID}</div>
                          <div className="order-date">
                            {new Date(order.OrderDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <div>
                          <div className={`order-status ${order.Status}`}>
                            {order.Status === 'in_progress' ? 'IN PROGRESS' : order.Status.toUpperCase()}
                          </div>
                          <div className="order-amount">${parseFloat(order.TotalAmount).toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="order-items">{order.Items}</div>
                      <div className="order-location">📍 {order.LocationName}</div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="orders-list">
                {completedOrders.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3 className="empty-title">No Order History</h3>
                    <p className="empty-message">Start ordering to see your history!</p>
                  </div>
                ) : (
                  completedOrders.map((order) => (
                    <div key={order.OrderID} className={`order-card ${order.Status}`}>
                      <div className="order-header">
                        <div>
                          <div className="order-id">Order #{order.OrderID}</div>
                          <div className="order-date">
                            {new Date(order.OrderDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <div>
                          <div className={`order-status ${order.Status}`}>
                            {order.Status.toUpperCase()}
                          </div>
                          <div className="order-amount">${parseFloat(order.TotalAmount).toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="order-items">{order.Items}</div>
                      <div className="order-location">📍 {order.LocationName}</div>
                      {order.Status === 'completed' && (
                        <div className="order-actions">
                          <button
                            className="feedback-btn"
                            onClick={() => openFeedbackModal(order)}
                            disabled={order.HasFeedback}
                          >
                            {order.HasFeedback ? '✓ Feedback Submitted' : '⭐ Leave Feedback'}
                          </button>
                          {order.HasFeedback && (
                            <div className="feedback-submitted-text">
                              ✓ Thank you for your feedback!
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditForm && (
          <div className="edit-form-overlay" onClick={() => setShowEditForm(false)}>
            <div className="edit-form-modal" onClick={(e) => e.stopPropagation()}>
              <div className="edit-form-header">
                <h2 className="edit-form-title">Edit Profile</h2>
                <button className="close-btn" onClick={() => setShowEditForm(false)}>×</button>
              </div>
              
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.Fname}
                  onChange={(e) => setEditForm({ ...editForm, Fname: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.Lname}
                  onChange={(e) => setEditForm({ ...editForm, Lname: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={editForm.Email}
                  onChange={(e) => setEditForm({ ...editForm, Email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={editForm.PhoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, PhoneNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={editForm.OptInMarketing}
                    onChange={(e) => setEditForm({ ...editForm, OptInMarketing: e.target.checked })}
                  />
                  <span>Receive marketing emails</span>
                </label>
              </div>

              <div className="form-actions">
                <button className="save-btn" onClick={handleUpdateProfile}>
                  Save Changes
                </button>
                <button className="cancel-btn" onClick={() => setShowEditForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && selectedOrder && (
          <div className="feedback-overlay" onClick={() => setShowFeedbackModal(false)}>
            <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="feedback-title">Rate Your Order</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>Order #{selectedOrder.OrderID}</p>

              <div className="rating-section">
                <label className="rating-label">Rating</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? 'filled' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="comments-section">
                <label className="rating-label">Comments (Optional)</label>
                <textarea
                  className="comments-textarea"
                  placeholder="Tell us about your experience..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  maxLength={500}
                />
              </div>

              <div className="feedback-actions">
                <button
                  className="submit-feedback-btn"
                  onClick={handleSubmitFeedback}
                  disabled={rating === 0}
                >
                  Submit Feedback
                </button>
                <button
                  className="cancel-feedback-btn"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setRating(0);
                    setComments('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomerProfile;