import { getAllEmployees } from "../model/Staff.js";

export const handleEmployee = async (req, res) => {
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
    } 
}