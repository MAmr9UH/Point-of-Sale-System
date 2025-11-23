import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginCustomer, loginEmployee, registerCustomer, storeToken, getToken, removeToken, getStoredUser, storeUser } from '../utils/jwtAuth';

export interface Customer {
    CustomerID: number;
    Email: string;
    PhoneNumber: string | null;
    Fname: string | null;
    Lname: string | null;
    IncentivePoints: number;
    OptInMarketing: boolean;
}

interface Staff {
    StaffID: number;
    Email: string;
    Fname: string;
    Lname: string;
    Role: string;
    HourlyWage: number;
}

interface AuthContextType {
    user: Customer | Staff | null;
    userType: 'customer' | 'employee' | 'manager' | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginStaff: (employeeId: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    updateUser: (updatedUser: Customer | Staff) => void;
}

interface RegisterData {
    email: string;
    password: string;
    fname: string;
    lname: string;
    phoneNumber?: string;
    optInMarketing?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Customer | Staff | null>(null);
    const [userType, setUserType] = useState<'customer' | 'employee' | 'manager' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is already logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = getToken();
                const storedUser = getStoredUser();

                if (token && storedUser) {
                    setUser(storedUser);

                    if ('Role' in storedUser || 'role' in storedUser) {
                        setUserType(storedUser.role || storedUser.Role);
                    } else {
                        setUserType('customer');
                    }
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                removeToken();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Customer or Staff login with email
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const data = await loginCustomer({ email, password });
            
            // Store token and user
            storeToken(data.token);
            storeUser(data.user);
            
            setUser(data.user as any);
            setUserType("customer");
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Staff login with employee ID
    const loginStaff = async (employeeId: string, password: string) => {
        setIsLoading(true);
        try {
            const data = await loginEmployee({ email: employeeId, password });
            
            console.log(data)

            // Store token and user
            storeToken(data.token);
            storeUser(data.user);

            setUser(data.user as any);
            setUserType((data.user.Role || 'employee') as 'employee' | 'manager');
        } catch (error) {
            console.error('Staff login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Customer registration
    const register = async (data: RegisterData) => {
        setIsLoading(true);
        try {
            const responseData = await registerCustomer({
                firstName: data.fname,
                lastName: data.lname,
                email: data.email,
                phone: data.phoneNumber || '',
                password: data.password
            });
            
            // Store token and user
            storeToken(responseData.token);
            storeUser(responseData.user);

            // Auto-login after successful registration
            setUser(responseData.user as any);
            setUserType('customer');
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Logout
    const logout = () => {
        setUser(null);
        setUserType(null);
        removeToken();
    };

    // Update user data
    const updateUser = (updatedUser: Customer | Staff) => {
        setUser(updatedUser);
        storeUser(updatedUser);
    };

    const value: AuthContextType = {
        user,
        userType,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginStaff,
        register,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    console.log('AuthContext:', context);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
