import React, { createContext, useContext, useState, useEffect } from 'react';
import { customerLogin, customerRegister } from '../utils/customerAuth';
import { staffLogin } from '../utils/staffAuth';

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
    userType: 'customer' | 'staff' | 'manager' | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginStaff: (employeeId: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
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
    const [userType, setUserType] = useState<'customer' | 'staff' | 'manager' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is already logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                const storedUserType = localStorage.getItem('userType');

                if (storedUser && storedUserType) {
                    setUser(JSON.parse(storedUser));
                    setUserType(storedUserType as 'customer' | 'staff');
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('userType');
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
            const data = await customerLogin(email, password)

            setUser(data.user);
            setUserType("customer");
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('userType', "customer");
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
            const data = await staffLogin(employeeId, password);

            setUser(data.user);
            setUserType(data.user.Role);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('userType', data.user.Role);
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
            const responseData = await customerRegister(data.fname, data.lname, data.email, data.phoneNumber as string, data.password);


            // Auto-login after successful registration
            setUser(responseData.user);
            setUserType('customer');
            localStorage.setItem('user', JSON.stringify(responseData.user));
            localStorage.setItem('userType', 'customer');
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
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
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
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
