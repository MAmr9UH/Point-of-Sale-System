import {
  fetchInventoryOrders,
  createInventoryOrder,
  fetchIngredients,
  updateInventoryOrder,
  deleteInventoryOrder,
} from '../model/EmployeeManagerModel.js';
import { withAuth } from '../utils/authMiddleware.js';

// server/routes/inventoryRoutes.js

// --- Function to handle all /api/inventory routes ---
export const handleInventoryRoutes = withAuth(async (req, res) => {
  const { url, method } = req;

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

  if (url.startsWith('/api/inventory/') && (method === 'PUT' || method === 'DELETE')) {
    const id = url.split('/').pop();
    if (method === 'PUT') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      }
      );
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          updateInventoryOrder(id, payload)
            .then(updatedOrder => {
              console.log('✅ Inventory order updated:', updatedOrder);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'Inventory order updated successfully', updatedOrder }));
            })
            .catch(err => {
              console.error('❌ Error updating inventory order:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Failed to update inventory order' }));
            });
        } catch (err) {
          console.error('❌ Error handling /api/inventory/:id PUT:', err);
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid JSON data' }));
        }
      });
      return true;
    } else if (method === 'DELETE') {
      deleteInventoryOrder(id)
        .then(() => {
          console.log('🗑️ Inventory order deleted:', id);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Inventory order deleted successfully' }));
        })
        .catch(err => {
          console.error('❌ Error deleting inventory order:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to delete inventory order' }));
        });
      return true;
    }

    return false; // not handled
  }
}, {
  roles: ['manager']
});