/**
 * JWT Authentication Utility for Frontend
 * 
 * This file provides helper functions to:
 * - Store and retrieve JWT tokens
 * - Make authenticated API requests
 * - Handle token expiration
 * - Manage user authentication state
 */

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Token Management
export const storeToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const storeUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredUser = (): any | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Authenticated Fetch Wrapper
interface AuthFetchOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Make an authenticated API request
 * Automatically includes Authorization header with JWT token
 * Handles 401 (unauthorized) by redirecting to login
 */
export const authenticatedFetch = async (
  url: string,
  options: AuthFetchOptions = {}
): Promise<Response> => {
  const { requireAuth = true, ...fetchOptions } = options;

  // Get token
  const token = getToken();

  if (requireAuth && !token) {
    // No token and authentication required
    window.location.href = '/login';
    throw new Error('Authentication required');
  }

  // Add Authorization header
  const headers = {
    ...fetchOptions.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  // Make request
  const response = await fetch(url, {
    ...fetchOptions,
    credentials: 'include',
    headers,
  });

  // Handle unauthorized
  if (response.status === 401) {
    // Token expired or invalid
    removeToken();
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  // Handle forbidden
  if (response.status === 403) {
    throw new Error('Access denied. You do not have permission for this action.');
  }

  return response;
};

// Authentication API Calls

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success?: boolean;
  message: string;
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
  token: string;
}

/**
 * Login as a customer
 */
export const loginCustomer = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch('/api/auth/customer-login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data: LoginResponse = await response.json();
  
  // Store token and user
  storeToken(data.token);
  storeUser(data.user);

  return data;
};

/**
 * Login as an employee or manager
 */
export const loginEmployee = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch('/api/auth/employee-login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data: LoginResponse = await response.json();
  
  // Store token and user
  storeToken(data.token);
  storeUser(data.user);

  return data;
};

interface RegisterData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}

/**
 * Register a new customer
 */
export const registerCustomer = async (data: RegisterData): Promise<LoginResponse> => {
  const response = await fetch('/api/auth/customer-register', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  const result: LoginResponse = await response.json();
  
  // Store token and user
  storeToken(result.token);
  storeUser(result.user);

  return result;
};

/**
 * Logout - clears token and user data
 */
export const logout = (): void => {
  removeToken();
  window.location.href = '/login';
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

/**
 * Get current user from storage
 */
export const getCurrentUser = (): any | null => {
  return getStoredUser();
};

/**
 * Check if user has specific role
 */
export const hasRole = (role: string): boolean => {
  const user = getStoredUser();
  return user?.role === role;
};

export const isCustomer = (): boolean => hasRole('customer');
export const isEmployee = (): boolean => hasRole('employee');
export const isManager = (): boolean => hasRole('manager');

// Example Usage Functions

/**
 * Example: Get customer profile (authenticated)
 */
export const getCustomerProfile = async (customerId: number) => {
  const response = await authenticatedFetch(`/api/customers/profile/${customerId}`);
  return response.json();
};

/**
 * Example: Update customer profile (authenticated)
 */
export const updateCustomerProfile = async (customerId: number, updates: any) => {
  const response = await authenticatedFetch(`/api/customers/profile/${customerId}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  return response.json();
};

/**
 * Example: Submit feedback (authenticated customer)
 */
export const submitFeedback = async (feedbackData: any) => {
  const response = await authenticatedFetch('/api/customers/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedbackData),
  });
  return response.json();
};

/**
 * Example: Get timecard (authenticated employee/manager)
 */
export const getTimecard = async (staffId: number) => {
  const response = await authenticatedFetch(`/api/timecard/staff/${staffId}`);
  return response.json();
};

/**
 * Example: Clock in (authenticated employee/manager)
 */
export const clockIn = async (staffId: number) => {
  const response = await authenticatedFetch('/api/timecard/clockin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ staffId }),
  });
  return response.json();
};

/**
 * Example: Clock out (authenticated employee/manager)
 */
export const clockOut = async (timecardId: number) => {
  const response = await authenticatedFetch('/api/timecard/clockout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ timecardId }),
  });
  return response.json();
};

/**
 * Example: Get all employees (manager only)
 */
export const getAllEmployees = async () => {
  const response = await authenticatedFetch('/api/employees');
  return response.json();
};

/**
 * Example: Create employee (manager only)
 */
export const createEmployee = async (employeeData: any) => {
  const response = await authenticatedFetch('/api/employees', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employeeData),
  });
  return response.json();
};

/**
 * Example: Get menu (public - no auth required)
 */
export const getMenu = async () => {
  const response = await authenticatedFetch('/api/menu', {
    requireAuth: false,
  });
  return response.json();
};
