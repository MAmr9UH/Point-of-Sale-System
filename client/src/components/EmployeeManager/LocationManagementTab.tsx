import React, { useState, useEffect } from 'react';
import { useToaster } from '../../contexts/ToastContext';
import { ConfirmDialog } from './ConfirmDialog';
import { authenticatedFetch } from '../../utils/jwtAuth';

interface Location {
  Name: string;
  Address: string;
  DailyFee: number;
  HostPhoneNumber: string;
  HostEmail: string;
  CreatedAt?: string;
  LastUpdatedAt?: string;
}

interface ActiveLocation {
  ActiveLocationID?: number;
  LocationName: string;
  BeginOperationOn: string;
  EndOperationOn?: string;
  DaysOfWeek: string[];
}

export const LocationManagementTab: React.FC = () => {
  const { addToast } = useToaster();
  
  // Location state
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [dailyFee, setDailyFee] = useState('');
  const [hostPhone, setHostPhone] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  // Active Location (Contract) state
  const [selectedLocationForContract, setSelectedLocationForContract] = useState('');
  const [beginDate, setBeginDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [activeLocations, setActiveLocations] = useState<ActiveLocation[]>([]);
  const [editingActiveLocation, setEditingActiveLocation] = useState<ActiveLocation | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    loadLocations();
    loadActiveLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await authenticatedFetch('/api/locations');
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
      addToast('Failed to load locations', 'error', 5000);
    }
  };

  const loadActiveLocations = async () => {
    try {
      const response = await authenticatedFetch('/api/locations/active');
      const data = await response.json();
      setActiveLocations(data);
    } catch (error) {
      console.error('Error loading active locations:', error);
      addToast('Failed to load active locations', 'error', 5000);
    }
  };

  // Location CRUD operations
  const handleSaveLocation = async () => {
    try {
      if (!locationName || !address) {
        addToast('Location name and address are required', 'error', 3000);
        return;
      }

      const payload = {
        Name: locationName,
        Address: address,
        DailyFee: dailyFee ? parseFloat(dailyFee) : 0,
        HostPhoneNumber: hostPhone,
        HostEmail: hostEmail,
      };

      const method = editingLocation ? 'PUT' : 'POST';
      const url = editingLocation
        ? `/api/locations/${encodeURIComponent(editingLocation.Name)}`
        : '/api/locations';

      const res = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      addToast(
        editingLocation ? 'Location updated successfully!' : 'Location created successfully!',
        'success',
        3000
      );

      resetLocationForm();
      await loadLocations();
    } catch (err) {
      console.error('Error saving location:', err);
      addToast(
        err instanceof Error ? err.message : 'Failed to save location',
        'error',
        5000
      );
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setLocationName(location.Name);
    setAddress(location.Address);
    setDailyFee(location.DailyFee.toString());
    setHostPhone(location.HostPhoneNumber);
    setHostEmail(location.HostEmail);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteLocation = (locationName: string) => {
    setConfirmDialog({
      show: true,
      title: 'Delete Location',
      message: `Are you sure you want to delete "${locationName}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const res = await authenticatedFetch(`/api/locations/${encodeURIComponent(locationName)}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${res.status}`);
          }

          addToast('Location deleted successfully!', 'success', 3000);
          await loadLocations();
        } catch (err) {
          console.error('Error deleting location:', err);
          addToast(
            err instanceof Error ? err.message : 'Failed to delete location',
            'error',
            5000
          );
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const resetLocationForm = () => {
    setEditingLocation(null);
    setLocationName('');
    setAddress('');
    setDailyFee('');
    setHostPhone('');
    setHostEmail('');
  };

  // Active Location (Contract) CRUD operations
  const handleSaveActiveLocation = async () => {
    try {
      if (!selectedLocationForContract || !beginDate || selectedDays.length === 0) {
        addToast('Location, begin date, and at least one day of the week are required', 'error', 3000);
        return;
      }

      const payload = {
        LocationName: selectedLocationForContract,
        BeginOperationOn: beginDate,
        EndOperationOn: endDate || null,
        DaysOfWeek: selectedDays,
      };

      const method = editingActiveLocation ? 'PUT' : 'POST';
      const url = editingActiveLocation
        ? `/api/locations/active/${editingActiveLocation.ActiveLocationID}`
        : '/api/locations/active';

      const res = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      addToast(
        editingActiveLocation ? 'Contract updated successfully!' : 'Contract created successfully!',
        'success',
        3000
      );

      resetActiveLocationForm();
      await loadActiveLocations();
    } catch (err) {
      console.error('Error saving contract:', err);
      addToast(
        err instanceof Error ? err.message : 'Failed to save contract',
        'error',
        5000
      );
    }
  };

  const handleEditActiveLocation = (activeLocation: ActiveLocation) => {
    setEditingActiveLocation(activeLocation);
    setSelectedLocationForContract(activeLocation.LocationName);
    setBeginDate(activeLocation.BeginOperationOn.split('T')[0]);
    setEndDate(activeLocation.EndOperationOn ? activeLocation.EndOperationOn.split('T')[0] : '');
    setSelectedDays(activeLocation.DaysOfWeek);
    window.scrollTo({ top: document.getElementById('contract-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  const handleDeleteActiveLocation = (activeLocationId: number) => {
    const activeLocation = activeLocations.find(al => al.ActiveLocationID === activeLocationId);
    setConfirmDialog({
      show: true,
      title: 'Delete Contract',
      message: `Are you sure you want to delete the contract for "${activeLocation?.LocationName}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const res = await authenticatedFetch(`/api/locations/active/${activeLocationId}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${res.status}`);
          }

          addToast('Contract deleted successfully!', 'success', 3000);
          await loadActiveLocations();
        } catch (err) {
          console.error('Error deleting contract:', err);
          addToast(
            err instanceof Error ? err.message : 'Failed to delete contract',
            'error',
            5000
          );
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const resetActiveLocationForm = () => {
    setEditingActiveLocation(null);
    setSelectedLocationForContract('');
    setBeginDate('');
    setEndDate('');
    setSelectedDays([]);
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <div className="form-container">
      <div className="page-header">
        <h1 className="page-title">Location Management</h1>
        <p className="page-subtitle">Manage locations and active contracts</p>
      </div>

      {/* Overview Section */}
      <div className="content-card" style={{ marginBottom: '24px' }}>
        <h2>📍 Current Locations & Active Contracts Overview</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {/* All Locations Card */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Locations
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
              {locations.length}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Available venues
            </div>
          </div>

          {/* Active Contracts Card */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Contracts
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
              {activeLocations.filter(al => !al.EndOperationOn || new Date(al.EndOperationOn) > new Date()).length}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Operational agreements
            </div>
          </div>

          {/* Current Operations Card */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Currently Operating
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
              {activeLocations.filter(al => !al.EndOperationOn || new Date(al.EndOperationOn) > new Date()).filter(al => al.DaysOfWeek.includes(new Date().toLocaleString('en-US', { weekday: 'short' }))).length}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Active today
            </div>
          </div>
        </div>

        {/* Detailed Lists */}
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ marginBottom: '16px', color: '#374151' }}>📋 Quick View</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '20px'
          }}>
            {/* All Locations List */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#f9fafb'
            }}>
              <h4 style={{ 
                marginBottom: '12px', 
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>📍</span>
                All Locations ({locations.length})
              </h4>
              {locations.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
                  No locations added yet
                </p>
              ) : (
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {locations.map((location) => (
                    <li key={location.Name} style={{
                      padding: '12px',
                      marginBottom: '8px',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                        {location.Name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {location.Address}
                      </div>
                      <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                        Daily Fee: ${Number(location.DailyFee).toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Active Contracts List */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#f9fafb'
            }}>
              <h4 style={{ 
                marginBottom: '12px', 
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>📝</span>
                Active Contracts ({activeLocations.length})
              </h4>
              {activeLocations.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
                  No active contracts yet
                </p>
              ) : (
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {activeLocations.map((activeLocation) => {
                    const isCurrentlyActive = !activeLocation.EndOperationOn || 
                      new Date(activeLocation.EndOperationOn) > new Date();
                    
                    return (
                      <li key={activeLocation.ActiveLocationID} style={{
                        padding: '12px',
                        marginBottom: '8px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: `2px solid ${isCurrentlyActive ? '#10b981' : '#6b7280'}`,
                        transition: 'all 0.2s'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '6px'
                        }}>
                          <div style={{ fontWeight: 600, color: '#1f2937' }}>
                            {activeLocation.LocationName}
                          </div>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: isCurrentlyActive ? '#d1fae5' : '#f3f4f6',
                            color: isCurrentlyActive ? '#065f46' : '#6b7280'
                          }}>
                            {isCurrentlyActive ? '✓ Active' : 'Ended'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                          📅 {new Date(activeLocation.BeginOperationOn).toLocaleDateString()} 
                          {activeLocation.EndOperationOn && 
                            ` - ${new Date(activeLocation.EndOperationOn).toLocaleDateString()}`
                          }
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#6b7280',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px',
                          marginTop: '6px'
                        }}>
                          {activeLocation.DaysOfWeek.map(day => (
                            <span key={day} style={{
                              padding: '2px 6px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '4px',
                              fontSize: '10px'
                            }}>
                              {day}
                            </span>
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Location Form */}
      <div className="content-card">
        <h2>Add/Edit Location</h2>
        
        {editingLocation && (
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
              Editing location - {editingLocation.Name}
            </span>
            <button
              onClick={resetLocationForm}
              style={{
                padding: '6px 12px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'black'
              }}
            >
              Cancel Edit
            </button>
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="locationName">Location Name *</label>
            <input
              id="locationName"
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g., Downtown Square"
              disabled={!!editingLocation}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 123 Main St, City, State 12345"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dailyFee">Daily Fee ($)</label>
            <input
              id="dailyFee"
              type="number"
              step="0.01"
              value={dailyFee}
              onChange={(e) => setDailyFee(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="hostPhone">Host Phone Number</label>
            <input
              id="hostPhone"
              type="tel"
              value={hostPhone}
              onChange={(e) => setHostPhone(e.target.value)}
              placeholder="1234567890"
              maxLength={10}
            />
          </div>

          <div className="form-group">
            <label htmlFor="hostEmail">Host Email</label>
            <input
              id="hostEmail"
              type="email"
              value={hostEmail}
              onChange={(e) => setHostEmail(e.target.value)}
              placeholder="host@example.com"
            />
          </div>
        </div>

        <button className="btn-primary" onClick={handleSaveLocation}>
          {editingLocation ? 'Update Location' : 'Add Location'}
        </button>

        {/* Locations List */}
        {locations.length > 0 && (
          <>
            <hr className="section-divider" />
            <h2>All Locations</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Daily Fee</th>
                  <th>Host Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.Name}>
                    <td>{location.Name}</td>
                    <td>{location.Address}</td>
                    <td>${Number(location.DailyFee).toFixed(2)}</td>
                    <td>
                      {location.HostEmail && <div>{location.HostEmail}</div>}
                      {location.HostPhoneNumber && <div>{location.HostPhoneNumber}</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          className="icon-button edit-button"
                          onClick={() => handleEditLocation(location)}
                          title="Edit location"
                        >
                          ✏️
                        </button>
                        <button
                          className="icon-button delete-button"
                          onClick={() => handleDeleteLocation(location.Name)}
                          title="Delete location"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Active Location (Contract) Form */}
      <div className="content-card" id="contract-section" style={{ marginTop: '24px' }}>
        <h2>Create/Edit Active Location Contract</h2>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          Create a contract to make a location active for operations on specific days
        </p>

        {editingActiveLocation && (
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
              Editing contract - {editingActiveLocation.LocationName}
            </span>
            <button
              onClick={resetActiveLocationForm}
              style={{
                padding: '6px 12px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'black'
              }}
            >
              Cancel Edit
            </button>
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="contractLocation">Location *</label>
            <select
              id="contractLocation"
              value={selectedLocationForContract}
              onChange={(e) => setSelectedLocationForContract(e.target.value)}
            >
              <option value="">Select a location</option>
              {locations.map((location) => (
                <option key={location.Name} value={location.Name}>
                  {location.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="beginDate">Begin Date *</label>
            <input
              id="beginDate"
              type="date"
              value={beginDate}
              onChange={(e) => setBeginDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date (Optional)</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>Days of Operation *</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                style={{
                  padding: '8px 16px',
                  border: selectedDays.includes(day) ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  backgroundColor: selectedDays.includes(day) ? '#3b82f6' : 'white',
                  color: selectedDays.includes(day) ? 'white' : '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={handleSaveActiveLocation}>
          {editingActiveLocation ? 'Update Contract' : 'Create Contract'}
        </button>

        {/* Active Locations List */}
        {activeLocations.length > 0 && (
          <>
            <hr className="section-divider" />
            <h2>Active Location Contracts</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Begin Date</th>
                  <th>End Date</th>
                  <th>Days of Week</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeLocations.map((activeLocation) => (
                  <tr key={activeLocation.ActiveLocationID}>
                    <td>{activeLocation.LocationName}</td>
                    <td>{new Date(activeLocation.BeginOperationOn).toLocaleDateString()}</td>
                    <td>
                      {activeLocation.EndOperationOn
                        ? new Date(activeLocation.EndOperationOn).toLocaleDateString()
                        : 'Ongoing'}
                    </td>
                    <td>{activeLocation.DaysOfWeek.join(', ')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          className="icon-button edit-button"
                          onClick={() => handleEditActiveLocation(activeLocation)}
                          title="Edit contract"
                        >
                          ✏️
                        </button>
                        <button
                          className="icon-button delete-button"
                          onClick={() => handleDeleteActiveLocation(activeLocation.ActiveLocationID!)}
                          title="Delete contract"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
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
