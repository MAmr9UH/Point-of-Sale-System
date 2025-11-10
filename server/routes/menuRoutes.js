import {
  fetchMenuItems,
  createMenuItem
} from '../model/EmployeeManagerModel.js';

// routes/menuRoutes.js
export function handleMenuRoutes(req, res) {
  const { url, method } = req;

  // GET /api/menuItems -> fetch from database
  if (url === '/api/menuItems' && method === 'GET') {
    fetchMenuItems()
      .then(items => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(items));
      })
      .catch(err => {
        console.error('❌ Error fetching menu items:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to fetch menu items' }));
      });

    return true;
  }

  // POST /api/menuItems -> persist to database
  if (url === '/api/menuItems' && method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        createMenuItem(payload)
          .then(createdItem => {
            const responseItem = {
              id: createdItem.id,
              name: createdItem.name,
              description: createdItem.description,
              price: createdItem.price,
              category: createdItem.category,
              availability: createdItem.availability,
              available: createdItem.availability
            };

            console.log('📦 New menu item saved:', responseItem);
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                message: 'Menu item added successfully',
                item: responseItem
              })
            );
          })
          .catch(err => {
            console.error('❌ Error saving menu item:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to save menu item' }));
          });
      } catch (err) {
        console.error('❌ Error parsing menu item payload:', err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON format' }));
      }
    });

    return true; // route handled
  }

  return false; // Not handled, continue to index.js routes
}
