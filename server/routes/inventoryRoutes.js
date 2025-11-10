import {
  fetchInventoryOrders,
  createInventoryOrder,
  fetchIngredients
} from '../model/EmployeeManagerModel.js';

// server/routes/inventoryRoutes.js

// --- Function to handle all /api/inventory routes ---
export function handleInventoryRoutes(req, res) {
  const { url, method } = req;

  if (method === 'GET' && url === '/api/ingredients') {
    fetchIngredients()
      .then(ingredients => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(ingredients));
      })
      .catch(err => {
        console.error('❌ Error fetching ingredients:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to fetch ingredients' }));
      });
    return true;
  }

  // ✅ GET all inventory orders from database
  if (method === 'GET' && url === '/api/inventory') {
    fetchInventoryOrders()
      .then(orders => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(orders));
      })
      .catch(err => {
        console.error('❌ Error fetching inventory orders:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to fetch inventory orders' }));
      });
    return true;
  }

  // ✅ POST a new inventory order
  if (method === 'POST' && url === '/api/inventory') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        createInventoryOrder(payload)
          .then(order => {
            console.log('📦 New inventory order saved:', order);
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Inventory order added successfully', order }));
          })
          .catch(err => {
            console.error('❌ Error saving inventory order:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to save inventory order' }));
          });
      } catch (err) {
        console.error('❌ Error handling /api/inventory POST:', err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON data' }));
      }
    });

    return true;
  }

  return false; // not handled
}
