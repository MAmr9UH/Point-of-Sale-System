import { getEmployeeShifts, assignStaffToShift } from '../model/Staff.js';

export const handleShifts = async (req, res) => {
    const { method, url } = req;
    if (method === 'POST' && url === '/api/shifts') {
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

        if (!id) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: "Employee ID is required" }));
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
    }
}