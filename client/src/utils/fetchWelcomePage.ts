export const fetchWelcomeData = async () => {
    try {
        const response = await fetch('/api/welcome/welcomeData', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        console.log('Fetched welcome page data:', data);

        return data;
    } catch (error) {
        console.error('Error fetching welcome page data:', error);
        throw error;
    }
}