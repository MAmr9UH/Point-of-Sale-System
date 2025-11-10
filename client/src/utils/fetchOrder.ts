export const createOrder = async (orderData: any) => {
    try {
        console.log('Creating order with data:', orderData);

        const response = await fetch('/api/checkout/userCreateOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};