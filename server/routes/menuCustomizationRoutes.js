import { db } from '../db/connection.js';

import { withAuth } from '../utils/authMiddleware.js';
/**
 * Handle menu customization-related API requests
 */
export const handleMenuCustomizationRoutes = withAuth(async (req, res) => {
  const { url, method } = req;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // GET /api/menu/customizations/:menuItemId -> fetch customizations for a menu item
    if (url.match(/^\/api\/menu\/customizations\/\d+$/) && method === 'GET') {
      const menuItemId = url.split('/api/menu/customizations/')[1];

      const [rows] = await db.query(`
        SELECT 
          uf.UsedForID,
          uf.MenuItemID,
          uf.IngredientID,
          i.Name as IngredientName,
          uf.CustomizableCategory,
          uf.QuantityRequired,
          uf.MaximumQuantity,
          uf.IsDefault,
          uf.PriceAdjustment,
          uf.IsRequired,
          uf.CanSubstitute
        FROM Used_For uf
        JOIN Ingredient i ON uf.IngredientID = i.IngredientID
        WHERE uf.MenuItemID = ?
        ORDER BY 
          uf.CustomizableCategory IS NULL DESC,
          uf.CustomizableCategory,
          uf.IsRequired DESC,
          uf.IsDefault DESC,
          i.Name
      `, [menuItemId]);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(rows));
      return;
    }

    // POST /api/menu/customizations -> create new customization
    if (url === '/api/menu/customizations' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const {
            MenuItemID,
            IngredientID,
            CustomizableCategory,
            QuantityRequired,
            MaximumQuantity,
            IsDefault,
            PriceAdjustment,
            IsRemovable,
            IsRequired,
            CanSubstitute
          } = JSON.parse(body);

          if (!MenuItemID || !IngredientID) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'MenuItemID and IngredientID are required' }));
            return;
          }

          await db.query(
            `INSERT INTO Used_For (
              MenuItemID, 
              IngredientID, 
              CustomizableCategory, 
              QuantityRequired, 
              MaximumQuantity, 
              IsDefault, 
              PriceAdjustment, 
              IsRequired, 
              CanSubstitute
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              MenuItemID,
              IngredientID,
              CustomizableCategory,
              QuantityRequired || 1,
              MaximumQuantity || 10,
              IsDefault || false,
              PriceAdjustment || 0,
              IsRequired || false,
              CanSubstitute || false
            ]
          );

          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Customization created successfully' }));
        } catch (error) {
          console.error('Error creating customization:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            error: error.code === 'ER_DUP_ENTRY' 
              ? 'This ingredient is already added to this menu item' 
              : 'Failed to create customization' 
          }));
        }
      });
      return;
    }

    // PUT /api/menu/customizations/:id -> update customization
    if (url.match(/^\/api\/menu\/customizations\/\d+$/) && method === 'PUT') {
      const usedForId = url.split('/api/menu/customizations/')[1];

      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const {
            CustomizableCategory,
            QuantityRequired,
            MaximumQuantity,
            IsDefault,
            PriceAdjustment,
            IsRemovable,
            IsRequired,
            CanSubstitute
          } = JSON.parse(body);

          await db.query(
            `UPDATE Used_For 
             SET CustomizableCategory = ?, 
                 QuantityRequired = ?, 
                 MaximumQuantity = ?, 
                 IsDefault = ?, 
                 PriceAdjustment = ?, 
                 IsRequired = ?, 
                 CanSubstitute = ?
             WHERE UsedForID = ?`,
            [
              CustomizableCategory,
              QuantityRequired || 1,
              MaximumQuantity || 10,
              IsDefault || false,
              PriceAdjustment || 0,
              IsRequired || false,
              CanSubstitute || false,
              usedForId
            ]
          );

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Customization updated successfully' }));
        } catch (error) {
          console.error('Error updating customization:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to update customization' }));
        }
      });
      return;
    }

    // DELETE /api/menu/customizations/:id -> delete customization
    if (url.match(/^\/api\/menu\/customizations\/\d+$/) && method === 'DELETE') {
      const usedForId = url.split('/api/menu/customizations/')[1];

      try {
        await db.query('DELETE FROM Used_For WHERE UsedForID = ?', [usedForId]);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Customization deleted successfully' }));
      } catch (error) {
        console.error('Error deleting customization:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to delete customization' }));
      }
      return;
    }

    // Route not found
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Route not found' }));

  } catch (error) {
    console.error('Error in menu customization routes:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}, {
  roles: ["manager"]
});