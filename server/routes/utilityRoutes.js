import {
  fetchUtilityPayments,
  createUtilityPayment
} from '../model/EmployeeManagerModel.js';

// routes/utilityRoutes.js
export function handleUtilityRoutes(req, res) {
  const { url, method } = req;

  // GET /api/utilities -> fetch from database
  if (url === '/api/utilities' && method === 'GET') {
    fetchUtilityPayments()
      .then(records => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(records));
      })
      .catch(err => {
        console.error('❌ Error fetching utility payments:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to fetch utility payments' }));
      });

    return true;
  }

  // POST /api/utilities -> persist to database
  if (url === '/api/utilities' && method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        createUtilityPayment(payload)
          .then(record => {
            console.log('💡 Utility payment saved:', record);
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Utility payment saved', record }));
          })
          .catch(err => {
            console.error('❌ Error saving utility payment:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to save utility payment' }));
          });
      } catch (e) {
        console.error('❌ Invalid utility payment payload:', e);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON data' }));
      }
    });

    return true;
  }

  // Not handled here
  return false;
}
