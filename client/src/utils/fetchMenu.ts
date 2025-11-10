export const fetchMenuEm = async () => {
    try {
        const response = await fetch('/api/menu/items');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched menu items:', data);
        return data;
    } catch (error) {
        console.error('Error fetching menu items:', error);
        throw error;
    }
};

export const fetchMenuCustomer = async () => {
    try {
        const response = await fetch('/api/menu/items/available');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched menu items:', data);
        return data;
    } catch (error) {
        console.error('Error fetching menu items:', error);
        throw error;
    }
};

export const updateMenuItem = async (itemData: any) => {    
    try {
        const response = await fetch(`/api/menu/updateItem/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating menu item:', error);
        throw error;
    }
}