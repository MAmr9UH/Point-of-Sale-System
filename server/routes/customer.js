import { searchCustomers } from "../model/Customer.js";

export const handleCustomer = async (req, res) => {
    const { method, url } = req;
    
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
    }
}
