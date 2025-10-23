export const fetchWelcomePage = async () => {
    try {
        const response = await fetch('/api/welcome/welcomeData');

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        console.log(response)

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching welcome page data:', error);
        throw error;
    }
}