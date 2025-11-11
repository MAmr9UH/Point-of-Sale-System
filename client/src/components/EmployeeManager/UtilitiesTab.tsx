import React, { useState, useEffect } from 'react';
import { UtilityForm } from './UtilityForm';
import { UtilityList } from './UtilityList';
import { ConfirmDialog } from './ConfirmDialog';
import { useToaster } from '../../contexts/ToastContext';


export const UtilitiesTab: React.FC = () => {
  const { addToast } = useToaster();
  const [utilityType, setUtilityType] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [utilityDate, setUtilityDate] = useState('');
  const [utilityLocation, setUtilityLocation] = useState('');
  const [utilitiesList, setUtilitiesList] = useState<any[]>([]);
  const [editingUtility, setEditingUtility] = useState<any | null>(null);
  
  // Multi-select filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    'water', 'electricity', 'gas', 'internet', 'phone', 'other'
  ]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    loadUtilities();
  }, []);

  const loadUtilities = async () => {
    try {
      const response = await fetch('/api/utilities');
      const data = await response.json();
      setUtilitiesList(data);
      
      // Extract unique locations from the data
      const uniqueLocations = Array.from(
        new Set(data.map((utility: any) => utility.locationName).filter(Boolean))
      ) as string[];
      setAllLocations(uniqueLocations);
      
      // Initialize selectedLocations if not already set
      if (selectedLocations.length === 0 && uniqueLocations.length > 0) {
        setSelectedLocations(uniqueLocations);
      }
    } catch (error) {
      console.error('Error loading utilities:', error);
      addToast('Failed to load utilities. Please try again.', 'error', 5000);
    }
  };

  // Toggle functions for multi-select filters
  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  // Filter utilities based on selected types and locations
  const filteredUtilities = utilitiesList.filter(utility => 
    selectedTypes.includes(utility.type.toLowerCase()) && 
    selectedLocations.includes(utility.locationName)
  );

  // Calculate total cost for filtered utilities
  const totalCost = filteredUtilities.reduce((sum, utility) => 
    sum + parseFloat(utility.amount || 0), 0
  );

  const handleSaveUtilityPayment = async () => {
    try {
      const payload = {
        type: utilityType,
        totalAmount: parseFloat(totalAmount),
        amount: parseFloat(totalAmount),
        date: utilityDate,
        locationName: utilityLocation,
      };

      const method = editingUtility ? 'PUT' : 'POST';
      const url = editingUtility 
        ? `/api/utilities/${editingUtility.paymentId}` 
        : '/api/utilities';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      addToast(
        editingUtility ? 'Utility payment updated successfully!' : 'Utility payment saved successfully!',
        'success',
        3000
      );

      setUtilityType('');
      setTotalAmount('');
      setUtilityDate('');
      setUtilityLocation('');
      setEditingUtility(null);

      await loadUtilities();
    } catch (err) {
      console.error('❌ Error saving utility payment:', err);
      addToast(
        err instanceof Error ? err.message : 'Failed to save utility payment. Please try again.',
        'error',
        5000
      );
    }
  };

  const handleEditUtility = (utility: any) => {
    setEditingUtility(utility);
    setUtilityType(utility.type);
    setTotalAmount(utility.amount.toString());
    setUtilityDate(utility.date);
    setUtilityLocation(utility.locationName);
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteUtility = async (paymentId: string) => {
    const utilityToDelete = utilitiesList.find(u => u.paymentId === paymentId);
    const utilityName = utilityToDelete 
      ? `${utilityToDelete.type} payment (${utilityToDelete.locationName})`
      : 'this utility payment';

    setConfirmDialog({
      show: true,
      title: 'Delete Utility Payment',
      message: `Are you sure you want to delete ${utilityName}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/utilities/${paymentId}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${res.status}`);
          }

          addToast('Utility payment deleted successfully!', 'success', 3000);
          await loadUtilities();
        } catch (err) {
          console.error('❌ Error deleting utility payment:', err);
          addToast(
            err instanceof Error ? err.message : 'Failed to delete utility payment. Please try again.',
            'error',
            5000
          );
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingUtility(null);
    setUtilityType('');
    setTotalAmount('');
    setUtilityDate('');
    setUtilityLocation('');
  };

  return (
    <div className="form-container">
      <div className="page-header">
        <h1 className="page-title">Utilities Management</h1>
        <p className="page-subtitle">Track and manage utility payments across locations</p>
      </div>

      <div className="content-card">
        {editingUtility && (
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: '#eff6ff', 
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#1e40af', fontWeight: 500 }}>
              Editing utility payment - {editingUtility.type}
            </span>
            <button 
              onClick={handleCancelEdit}
              style={{
                padding: '6px 12px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: "black"
              }}
            >
              Cancel Edit
            </button>
          </div>
        )}
        
        <UtilityForm
          utilityType={utilityType}
          setUtilityType={setUtilityType}
          utilityLocation={utilityLocation}
          setUtilityLocation={setUtilityLocation}
          totalAmount={totalAmount}
          setTotalAmount={setTotalAmount}
          utilityDate={utilityDate}
          setUtilityDate={setUtilityDate}
          onSave={handleSaveUtilityPayment}
        />

        {/* Filters and Total Cost Section */}
        {utilitiesList.length > 0 && (
          <>
            <hr className="section-divider" />
            
            {/* Header with Title and Total Cost */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <h2 style={{ margin: 0 }}>Utility Payments</h2>
              
              {/* Total Cost Card */}
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
                  {(selectedTypes.length > 0 && selectedTypes.length < 6) || 
                   (selectedLocations.length > 0 && selectedLocations.length < allLocations.length)
                    ? ' (Filtered)'
                    : ''
                  }
                </div>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: 700,
                  color: 'white'
                }}>
                  ${totalCost.toFixed(2)}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginTop: '4px'
                }}>
                  {filteredUtilities.length} of {utilitiesList.length} payments
                </div>
              </div>
            </div>

            {/* Filters Row */}
            <div style={{ 
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Type Filter */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '8px'
              }}>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Filter by Type:
                </span>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {['water', 'electricity', 'gas', 'internet', 'phone', 'other'].map(type => {
                    const colors = {
                      water: '#3b82f6',
                      electricity: '#f59e0b',
                      gas: '#ef4444',
                      internet: '#8b5cf6',
                      phone: '#10b981',
                      other: '#6b7280'
                    };
                    const color = colors[type as keyof typeof colors];
                    
                    return (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        style={{
                          padding: '8px 16px',
                          border: selectedTypes.includes(type) ? `2px solid ${color}` : '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 500,
                          backgroundColor: selectedTypes.includes(type) ? color : 'white',
                          color: selectedTypes.includes(type) ? 'white' : '#374151',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          outline: 'none',
                          textTransform: 'capitalize'
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedTypes.includes(type)) {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedTypes.includes(type)) {
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location Filter */}
              {allLocations.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    Filter by Location:
                  </span>
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    {allLocations.map(location => (
                      <button
                        key={location}
                        onClick={() => toggleLocation(location)}
                        style={{
                          padding: '8px 16px',
                          border: selectedLocations.includes(location) ? '2px solid #0ea5e9' : '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 500,
                          backgroundColor: selectedLocations.includes(location) ? '#0ea5e9' : 'white',
                          color: selectedLocations.includes(location) ? 'white' : '#374151',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedLocations.includes(location)) {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedLocations.includes(location)) {
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <UtilityList 
          utilities={filteredUtilities} 
          onEdit={handleEditUtility}
          onDelete={handleDeleteUtility}
        />
      </div>

      {confirmDialog?.show && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
        />
      )}
    </div>
  );
};
