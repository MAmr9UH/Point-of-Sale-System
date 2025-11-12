import { db } from '../db/connection.js';
import { getCurrentActiveLocations } from '../model/ActiveLocation.js';

export const handleWelcome = async (req, res) => {
    const { method, url } = req;
    if (method === 'GET' && url === '/api/welcome/welcomeData') {
        const [ results ] = await db.execute('SELECT * FROM Truck');

        if (results.length === 0) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({}));
            return;
        }

        const al = await getCurrentActiveLocations();

        const ans = {
            FoodTruckName: results[0].FoodTruckName,
            ContactEmail: results[0].ContactEmail,
            PhoneNumber: results[0].PhoneNumber,
            Status: results[0].Status,
            BackgroundURL: results[0].BackgroundURL,
            Tagline: results[0].Tagline,
            ActiveLocations: al
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(ans));
    } else if (method === 'GET' && url === '/api/welcome/feedback') {
        // Fetch top 10 most recent customer feedback
        try {
            const [ feedbackResults ] = await db.execute(`
                SELECT 
                    cf.Rating,
                    cf.Comments,
                    cf.SubmittedAt,
                    c.Fname,
                    c.Lname
                FROM customer_feedback cf
                JOIN customer c ON cf.CustomerID = c.CustomerID
                ORDER BY cf.SubmittedAt DESC
                LIMIT 10
            `);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(feedbackResults));
        } catch (err) {
            console.error('Error fetching feedback:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify([]));
        }
    } else if (method === 'GET' && url === '/api/welcome/test') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: "Test endpoint reached" }));
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: "Not Found" }));
    }
};