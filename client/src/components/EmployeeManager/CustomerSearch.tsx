import React, { useState, useEffect, useRef } from 'react';
import './CustomerSearch.css';

interface Customer {
  CustomerID: number;
  Fname: string | null;
  Lname: string | null;
  Email: string;
  PhoneNumber: string | null;
}

interface CustomerSearchProps {
  onSelect: (customer: Customer) => void;
  selectedCustomer: Customer | null;
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({ onSelect, selectedCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/customers/search?q=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
          throw new Error('Failed to search customers');
        }

        const data = await response.json();
        setResults(data);
        setShowResults(true);
      } catch (err) {
        setError('Failed to search customers. Please try again.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, [searchTerm]);

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    setSearchTerm('');
    setResults([]);
    setShowResults(false);
  };

  const handleClearSelection = () => {
    onSelect(null as any);
    setSearchTerm('');
  };

  const getCustomerDisplayName = (customer: Customer) => {
    const name = [customer.Fname, customer.Lname].filter(Boolean).join(' ');
    return name || 'Unknown Name';
  };

  return (
    <div className="customer-search-wrapper" ref={searchRef}>
      {selectedCustomer ? (
        <div className="selected-customer-display">
          <div className="selected-customer-info">
            <div className="selected-customer-name">
              {getCustomerDisplayName(selectedCustomer)}
            </div>
            <div className="selected-customer-details">
              {selectedCustomer.Email}
              {selectedCustomer.PhoneNumber && ` • ${selectedCustomer.PhoneNumber}`}
            </div>
          </div>
          <button 
            className="clear-selection-btn" 
            onClick={handleClearSelection}
            type="button"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <div className="customer-search-input-wrapper">
            <svg className="search-icon-small" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              className="customer-search-input"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
            />
            {isLoading && (
              <div className="search-spinner">⟳</div>
            )}
          </div>

          {error && <div className="search-error">{error}</div>}

          {showResults && results.length > 0 && (
            <div className="customer-search-results">
              {results.map((customer) => (
                <div
                  key={customer.CustomerID}
                  className="customer-result-item"
                  onClick={() => handleSelect(customer)}
                >
                  <div className="customer-result-name">
                    {getCustomerDisplayName(customer)}
                  </div>
                  <div className="customer-result-details">
                    {customer.Email}
                    {customer.PhoneNumber && ` • ${customer.PhoneNumber}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showResults && !isLoading && results.length === 0 && searchTerm.length >= 2 && (
            <div className="customer-search-results">
              <div className="no-results">No customers found</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
