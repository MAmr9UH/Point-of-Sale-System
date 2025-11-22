import { getAllEmployees } from "../model/Staff.js";
import { removeEmployee } from "../model/Staff.js";
import { createEmployeeFromCustomer, updateEmployeePayRate } from "../model/Staff.js";
import { withAuth } from '../utils/authMiddleware.js';

const employeeHandler = async (req, res) => {
    const { method, url } = req;
    if (method === 'GET' && url === '/api/employees') {
        try {
            const employees = await getAllEmployees();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(employees));
        } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: "Failed to fetch employees", details: error.message }));
        }
    } else if (method === 'POST' && url === '/api/employees') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { customerId, PayRate } = JSON.parse(body);
                
                if (!customerId) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: "Customer ID is required" }));
                    return;
                }
                
                if (!PayRate || isNaN(parseFloat(PayRate)) || parseFloat(PayRate) <= 0) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: "Valid pay rate is required" }));
                    return;
                }
                
                const newEmployee = await createEmployeeFromCustomer(customerId, PayRate);
                
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: "Employee created successfully", employee: newEmployee }));
            } catch (error) {
                console.error('Error creating employee:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: "Failed to create employee", details: error.message }));
            }
        });
    } else if (method === 'DELETE' && url.startsWith('/api/employees/')) {
        const id = url.split('/').pop();

        try {
            const employee = await removeEmployee(id);

            if (employee) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
            } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: "Employee not found" }));
            }
        } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: "Failed to delete employee", details: error.message }));
            return;
        }
    } else if (method === 'PUT' && url.startsWith("/api/employees/") && url.split('/').length === 4) {
    
        const id = url.split('/').pop();
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { PayRate } = JSON.parse(body);
                if (!PayRate || isNaN(parseFloat(PayRate)) || parseFloat(PayRate) <= 0) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: "Valid pay rate is required" }));
                    return;
                }
                const updatedEmployee = await updateEmployeePayRate(id, PayRate);
                if (updatedEmployee) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: "Employee pay rate updated successfully", employee: updatedEmployee }));
                } else {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: "Employee not found" }));
                }
            } catch (error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: "Failed to update employee pay rate", details: error.message }));
            }
        });
    }
}

// Export with JWT authentication - manager only
export const handleEmployee = withAuth(employeeHandler, {
    roles: ['manager']
});
