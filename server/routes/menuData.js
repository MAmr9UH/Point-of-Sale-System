
import { getAllMenuItems } from "../model/MenuItem";

export const handleMenu = async (req, res) => {
    const { method, url } = req;
    
    if (method === 'GET' && url === '/api/menu/items') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const menuItems = await getAllMenuItems();
        res.end(JSON.stringify(menuItems));
    } else if (method === 'GET' && url === '/api/menu/createOrder') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: "Test endpoint reached" }));
    } else if (method === 'GET' && url === '/api/menu/viewOrders') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: "Test endpoint reached" }));
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: "Not Found" }));
    }
};