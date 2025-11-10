
import { getAllMenuItems, updateMenuItem, deleteMenuItem } from "../model/MenuItem.js";

import { createMenuItem } from "../model/EmployeeManagerModel.js";

export const handleMenu = async (req, res) => {
    const { method, url } = req;

    if (method === 'GET' && url === '/api/menu/items') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const menuItems = await getAllMenuItems(false);
        res.end(JSON.stringify(menuItems));
    } else if (method === 'GET' && url === '/api/menu/items/available') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const menuItems = await getAllMenuItems(true);
        res.end(JSON.stringify(menuItems));
    } else if (method === 'POST' && url === '/api/menu/updateItem/') {
        let body = '';

        req.on('data', chunk => {
        body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const payload = JSON.parse(body);
                
                if (payload.MenuItemID) {
                    const updatedItem = await updateMenuItem(payload.MenuItemID, payload);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: "Menu item updated successfully", item: updatedItem }));
                } else {
                    const createdItem = await createMenuItem(payload);
                    res.statusCode = 201;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: "Menu item created successfully", item: createdItem }));
                }
            } catch (error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: "Failed to update menu item", details: error.message }));
            }
        });

        return;
    } else if (method === 'DELETE' && url.startsWith('/api/menu/')) {
        const id = url.split('/').pop();

        try {
            await deleteMenuItem(id);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: `Menu item with ID ${id} deleted successfully` }));
        } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: "Failed to delete menu item", details: error.message }));
            return;
        }

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