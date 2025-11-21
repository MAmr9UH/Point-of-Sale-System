import { searchCustomers } from "../model/Customer.js";
import { getCustomerById, getOrdersByCustomerId, getMostOrderedItem, submitFeedback, updateCustomerInfo } from '../model/CustomerProfile.js';

export const handleCustomer = async (req, res) => {
    const { method, url } = req;

    const profileMatch = url.match(/^\/api\/customers\/profile\/(\d+)$/);
    const feedbackMatch = url.match(/^\/api\/customers\/feedback$/);
    const updateMatch = url.match(/^\/api\/customers\/profile\/(\d+)\/update$/);


    if (method === 'GET' && url.startsWith('/api/customers/search')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const searchTerm = urlParams.get('q') || '';

        if (!searchTerm || searchTerm.trim().length < 2) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: "Search term must be at least 2 characters" }));
            return;
        }

        try {
            const customers = await searchCustomers(searchTerm);

            // Format response to only include necessary fields (without password hash)
            const formattedCustomers = customers.map(customer => ({
                CustomerID: customer.customerID,
                Fname: customer.fname,
                Lname: customer.lname,
                Email: customer.email,
                PhoneNumber: customer.phoneNumber
            }));

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(formattedCustomers));
        } catch (error) {
            console.error('Error searching customers:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: "Failed to search customers", details: error.message }));
        }
    } else if (method === 'GET' && profileMatch) {
        const customerId = profileMatch[1];

        try {
            const customer = await getCustomerById(customerId);
            if (!customer) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Customer not found' }));
                return;
            }

            const orders = await getOrdersByCustomerId(customerId);
            const mostOrderedItem = await getMostOrderedItem(customerId);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, customer, orders, mostOrderedItem }));
        } catch (err) {
            console.error('Error fetching customer profile:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Failed to fetch profile', details: err.message }));
        }
    } else if (method === 'POST' && feedbackMatch) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { customerId, orderId, rating, comments } = JSON.parse(body);

                if (!customerId || !orderId || !rating) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: false, error: 'Missing required fields' }));
                    return;
                }

                if (rating < 1 || rating > 5) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: false, error: 'Rating must be between 1 and 5' }));
                    return;
                }

                const feedbackId = await submitFeedback(customerId, orderId, rating, comments);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, feedbackId, message: 'Feedback submitted successfully' }));
            } catch (err) {
                console.error('Error submitting feedback:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
    } else if (method === 'PUT' && updateMatch) {
        const customerId = updateMatch[1];

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const updates = JSON.parse(body);

                await updateCustomerInfo(customerId, updates);

                const updatedCustomer = await getCustomerById(customerId);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, customer: updatedCustomer, message: 'Profile updated successfully' }));
            } catch (err) {
                console.error('Error updating profile:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
    }
}
