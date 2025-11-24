import { getEmployeeShifts, assignStaffToShift, deleteShift } from '../model/Staff.js';
import { withAuth, isManager, getAuthStaffId, isEmployee } from '../utils/authMiddleware.js';

export const handleShifts = withAuth(async (req, res) => {
    const { method, url } = req;
    if (method === 'POST' && url === '/api/shifts') {
        if (!isManager(req)) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: "Forbidden: Only managers can create shifts" }));
            return;
        }

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body);
                // Implement shift creation logic here
                await assignStaffToShift(payload.staffId, payload.activeLocationId, payload.scheduleStart, payload.scheduleEnd);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: "Shift created successfully" }));
            }
            catch (error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: "Failed to create shift", details: error.message }));
            }
        });
    } else if (method === 'GET' && url.startsWith('/api/shifts/staff') && url.split('/').at(-1).match(/^\d+$/)) {
        const id = url.split('/').at(-1);

        if (!isManager(req) && !isEmployee(req)) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: "Forbidden: Only managers and employees can view shifts" }));
            return;
        }

        if (id != getAuthStaffId(req) && !isManager(req)) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: "Forbidden: Employees can only view their own shifts" }));
            return;
        }

        try {

            const shifts = await getEmployeeShifts(id);
            console.log("Shifts fetched:", shifts);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(shifts));
        } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: "Failed to fetch shifts", details: error.message }));
        }
    } else if (method === 'DELETE' && url.startsWith('/api/shifts') && url.split('/').at(-1).match(/^\d+$/)) {
        const id = url.split('/').at(-1);

        try {

            const success = await deleteShift(id);
            if (success) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: `Shift with ID ${id} deleted successfully` }));
            } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: `Shift with ID ${id} not found` }));
            }

        } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: "Failed to delete shift", details: error.message }));   
        }

    }
}, {
    roles: ['manager', 'employee']
})