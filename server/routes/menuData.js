
import MenuItem, { getAllMenuItems } from "../model/MenuItem.js";

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
    } else if (method === 'POST' && url === '/api/menu/createMenuItem') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');

        const body = req.body;
        const newItem = new MenuItem(body);
        if (newItem.validate().isValid) {
            // Here you would normally insert the new item into the database
            res.end(JSON.stringify({ message: "Menu item created successfully", item: newItem }));
        } else {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Invalid menu item data", details: newItem.validate().errors }));
        }
        
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: "Not Found" }));
    }
};