import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {TopNav} from "../components/TopNav";

// TypeScript interfaces
interface Customer {
  CustomerID: number;
  Email: string;
  Fname: string;
  Lname: string;
  PhoneNumber: string;
  IncentivePoints: number;
}

interface Order {
  OrderID: number;
  OrderDate: string;
  TotalAmount: string;
  PaymentMethod: string;
  LocationName: string;
  Items: string;
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

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const customerId = (user as Customer).CustomerID;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/customer/profile/${customerId}`); // Fixed URL
        const data = await response.json();
        if (data.success) {
          setProfileData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]); // Changed: use 'user' instead of 'customerId'

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>;
  }

  if (!user) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Please log in to view your profile</div>;
  }

  if (!profileData) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Profile not found</div>;
  }

  const { customer, orders, mostOrderedItem } = profileData;
  return (
  <>
    <TopNav />
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#2A9D8F',
          color: 'white',
          padding: '40px 30px',
          borderRadius: '16px',
          marginBottom: '30px',
          boxShadow: '0 4px 12px rgba(42, 157, 143, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserIcon style={{ width: '40px', height: '40px' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>
                {customer.Fname} {customer.Lname}
              </h1>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '16px' }}>
                {customer.Email}
              </p>
              <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                Points: {customer.IncentivePoints}
              </p>
            </div>
          </div>
        </div>

        {/* Most Ordered Item */}
        {mostOrderedItem && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '16px',
            marginBottom: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '20px', 
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <StarIcon style={{ width: '24px', height: '24px', color: '#FFD700' }} />
              Your Favorite
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img 
                src={mostOrderedItem.ImageURL} 
                alt={mostOrderedItem.Name}
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '12px'
                }}
              />
              <div>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#2A9D8F' }}>
                  {mostOrderedItem.Name}
                </h3>
                <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '16px' }}>
                  Ordered {mostOrderedItem.TotalOrdered} times
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order History */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#333' }}>
            Order History
          </h2>
          {orders && orders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((order) => (
                <div key={order.OrderID} style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ 
                        fontWeight: '600', 
                        color: '#333',
                        fontSize: '16px'
                      }}>
                        Order #{order.OrderID}
                      </span>
                      <div style={{ 
                        color: '#666', 
                        fontSize: '14px',
                        marginTop: '4px'
                      }}>
                        {new Date(order.OrderDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: '700', 
                      color: '#2A9D8F'
                    }}>
                      ${parseFloat(order.TotalAmount).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ 
                    color: '#666', 
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}>
                    {order.Items}
                  </div>
                  <div style={{ 
                    marginTop: '8px',
                    fontSize: '13px',
                    color: '#999'
                  }}>
                    {order.LocationName}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: '40px 0' }}>
              No orders yet. Start ordering to see your history!
            </p>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default CustomerProfile;