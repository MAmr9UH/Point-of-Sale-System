export const fetchMenuEm = async () => {
    try {
        const response = await fetch('/api/menuItems');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching menu items:', error);
        throw error;
    }
};