export const customerLogin = async (email: string, password: string) => {
    try {
        const response = await fetch('/api/auth/customer-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error during customer login:', error);
        throw error;
    }
};

export const customerRegister = async (firstName: string, lastName: string, email: string, phone: string, password: string) => {
    try {
        const response = await fetch('/api/auth/customer-register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName, lastName, email, phone, password }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error during customer registration:', error);
        throw error;
    }
};