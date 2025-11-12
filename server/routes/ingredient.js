import { getAllIngredients, updateIngredient, createIngredient } from '../model/Ingredient.js';

export const handleIngredient = async (req, res) => {
    const { method, url } = req;
    if (method === 'GET' && url === '/api/ingredients') {
        try {

            const ingredients = await getAllIngredients();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(ingredients));
        } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: "Failed to fetch ingredients", details: error.message }));
        }
    } else if (method === 'PUT' && url.startsWith('/api/ingredients') && url.split('/').length === 4) {
        const id = url.split('/').pop();

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const updatedData = JSON.parse(body);
                await updateIngredient(id, updatedData);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: `Ingredient with ID ${id} updated successfully.` }));
            } catch (error) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: "Invalid JSON", details: error.message }));
            }
        });

    } else if (method === 'POST' && url.startsWith('/api/ingredients') && url.split('/').length === 3) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const newIngredientData = JSON.parse(body);
                const newIngredient = await createIngredient(newIngredientData);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(newIngredient));
            } catch (error) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: "Invalid JSON", details: error.message }));
            }
        });
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: "Not Found" }));
    }
};