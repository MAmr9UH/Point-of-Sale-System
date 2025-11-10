import { getAllIngredients } from '../model/Ingredient.js';

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
    }
};