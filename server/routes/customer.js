import { searchCustomers } from "../model/Customer.js";
import { getCustomerById, getOrdersByCustomerId, getMostOrderedItem, submitFeedback, updateCustomerInfo } from '../model/CustomerProfile.js';
import { withAuth, getAuthCustomerId, isCustomer, verifyOwnership } from '../utils/authMiddleware.js';

const customerHandler = async (req, res) => {
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

        // Verify ownership - customers can only view their own profile
        if (isCustomer(req) && !verifyOwnership(req, res, customerId)) {
            return;
        }

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

                // Verify ownership - customers can only submit feedback for their own orders
                if (isCustomer(req) && !verifyOwnership(req, res, customerId)) {
                    return;
                }

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

        // Verify ownership - customers can only update their own profile
        if (isCustomer(req) && !verifyOwnership(req, res, customerId)) {
            return;
        }

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

// Export with JWT authentication
// Search requires employee/manager role to search for customers
export const handleCustomer = (req, res) => {
    const { url } = req;
    
    // Customer search requires employee or manager role
    if (url.startsWith('/api/customers/search')) {
        return withAuth(customerHandler, {
            roles: ['employee', 'manager']
        })(req, res);
    }
    
    // Profile, feedback, and update require customer role (with ownership checks inside handler)
    return withAuth(customerHandler, {
        roles: ['customer']
    })(req, res);
};
