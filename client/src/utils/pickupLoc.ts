import { authenticatedFetch } from './jwtAuth';

export const fetchPickupLocations = async () => {
    try {
        const response = await authenticatedFetch('/api/checkout/getPickupLocations', {
            requireAuth: true // Pickup locations might be public
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        return data;
    }
    catch (error) {
        console.error('Error fetching pickup locations:', error);
        throw error;
    }
};