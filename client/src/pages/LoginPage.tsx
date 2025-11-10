import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { useToaster } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage({ registering = false } : { registering?: boolean }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'customer' | 'staff'>('customer');
  const [isRegistering, setIsRegistering] = useState(registering);
  
  const { addToast } = useToaster();
  const { login, register, loginStaff } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Staff fields
  const [employeeEmail, setEmployeeEmail] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'customer') {
      if (isRegistering) {
        // Handle customer registration
        if (password !== confirmPassword) {
          addToast('Passwords do not match!', 'error');
          return;
        }
        console.log('Customer Registration:', { firstName, lastName, email, phone, password });

        try {
          const data = await register({ email, password, fname : firstName, lname: lastName, phoneNumber: phone });
          console.log('Registration successful:', data);
        }
        catch (error) {
          console.error('Registration failed:', error);
          addToast('Registration failed. Please try again.' + error, 'error');
        }

      } else {
        console.log('Customer Login:', { email, password });
        
        try {
          const data = await login(email, password);
          console.log('Login successful:', data);
        } catch (error) {
          console.error('Login failed:', error);
          addToast('Login failed. Please check your credentials and try again.', 'error');
        }

      }
    } else {
      // Handle staff login
      console.log('Staff Login:', { employeeEmail, password });
      // TODO: API call for staff login
      try {
        const data = await loginStaff(employeeEmail, password);
        console.log('Staff Login successful:', data);
      } catch (error) {
        console.error('Staff Login failed:', error);
        addToast('Staff Login failed. Please check your credentials and try again.', 'error');
      }
    }
  };
  
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmployeeEmail('');
  };
  
  const switchTab = (tab: 'customer' | 'staff') => {
    setActiveTab(tab);
    setIsRegistering(false);
    resetForm();
  };
  
  const toggleRegister = () => {
    setIsRegistering(!isRegistering);
    resetForm();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Tab Switcher */}
        <div className="tab-container">
          <button
            className={`tab-button ${activeTab === 'customer' ? 'active' : ''}`}
            onClick={() => switchTab('customer')}
          >
            <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Customer
          </button>
          <button
            className={`tab-button ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => switchTab('staff')}
          >
            <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Staff
          </button>
        </div>

        {/* Form Content */}
        <div className="form-content">
          <h1 className="login-title">
            {activeTab === 'customer' 
              ? (isRegistering ? 'Create Account' : 'Welcome Back') 
              : 'Staff Login'}
          </h1>
          <p className="login-subtitle">
            {activeTab === 'customer' && !isRegistering && (
              <>New here? <button className="link-button" onClick={toggleRegister}>Sign up</button></>
            )}
            {activeTab === 'customer' && isRegistering && (
              <>Already have an account? <button className="link-button" onClick={toggleRegister}>Sign in</button></>
            )}
            {activeTab === 'staff' && 'Enter your credentials to access the system'}
          </p>

          <form onSubmit={handleSubmit}>
            {/* Customer Registration Fields */}
            {activeTab === 'customer' && isRegistering && (
              <>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    className="login-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    className="login-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="login-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="login-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    placeholder="Create a password"
                    className="login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    className="login-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* Customer Login Fields */}
            {activeTab === 'customer' && !isRegistering && (
              <>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="login-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* Staff Login Fields */}
            {activeTab === 'staff' && (
              <>
                <div className="form-group">
                  <label className="form-label">Employee Email</label>
                  <input
                    type="email"
                    placeholder="Enter your employee email"
                    className="login-input"
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <button type="submit" className="submit-btn">
              {activeTab === 'customer' 
                ? (isRegistering ? 'Create Account' : 'Sign In') 
                : 'Staff Sign In'}
            </button>

            {!isRegistering && (
              <>
                <div className="divider">
                  <span>or</span>
                </div>

                <button type="button" className="forgot-password-btn">
                  Forgot Password?
                </button>
              </>
            )}
          </form>
          
          <button className="home-link" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
