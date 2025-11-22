import { findCustomerByEmail, createNewCustomer } from "../model/Customer.js";
import { findStaffByEmail } from "../model/Staff.js";
import { generateToken } from "../utils/jwt.js";

export const handleAuth = (req, res) => {
    const { method, url } = req;
    if (method === 'POST' && url === '/api/auth/customer-login') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const { email, password } = JSON.parse(body);

            const customer = await findCustomerByEmail(email);
            if (!customer) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid email or password' }));
                return;
            }

            const isPasswordValid = await customer.validatePassword(password);
            if (!isPasswordValid) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid email or password' }));
                return;
            }

            // Generate JWT token for customer
            const token = generateToken({
                id: customer.customerID,
                email: customer.email,
                role: 'customer'
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Login successful', user: customer, token }));
        });
    } else if (method === 'POST' && url === '/api/auth/customer-register') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const { firstName: fname, lastName: lname, phone : phoneNumber, email, password } = JSON.parse(body);


            const customer = await findCustomerByEmail(email);
            if (customer) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Email already exist, please login' }));
                return;
            }
            try {
                const newCustomer = await createNewCustomer({ fname, lname, phoneNumber, email, password });
    
                // Generate JWT token for new customer
                const token = generateToken({
                    id: newCustomer.customerID,
                    email: newCustomer.email,
                    role: 'customer'
                });

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Registration successful', user: newCustomer, token }));
            } catch (error) {
                console.error('Error creating customer:', error);
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'DB Error', details: error.message }));
            }
        });
    } else if (method === 'POST' && url === '/api/auth/employee-login') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const { email, password } = JSON.parse(body);
            const staff = await findStaffByEmail(email);
            console.log('Staff found:', staff);

            if (!staff) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid email or password' }));
                return;
            }
            const isPasswordValid = await staff.validatePassword(password);
            if (!isPasswordValid) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid email or password' }));
                return;
            }

            // Generate JWT token for staff (employee or manager)
            const token = generateToken({
                id: staff.staffID,
                email: staff.email,
                role: staff.role // 'employee' or 'manager'
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Login successful', user: staff, token }));
        });
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: "Not Found" }));
    }
};