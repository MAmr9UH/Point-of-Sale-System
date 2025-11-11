import {
  fetchUtilityPayments,
  createUtilityPayment,
  updateUtilityPayment,
  deleteUtilityPayment
} from '../model/EmployeeManagerModel.js';
import { getAllLocations } from '../model/ActiveLocation.js';

// routes/utilityRoutes.js
export function handleUtilityRoutes(req, res) {
  const { url, method } = req;

  // GET /api/utilities/locations -> fetch all active locations
  if (url === '/api/utilities/locations' && method === 'GET') {
    getAllLocations()
      .then(locations => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(locations));
      })
      .catch(err => {
        console.error('❌ Error fetching locations:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to fetch locations' }));
      });

    return true;
  }

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

  // PUT /api/utilities/:id -> update utility payment
  if (url.startsWith('/api/utilities/') && method === 'PUT') {
    const paymentId = url.split('/').pop();
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        updateUtilityPayment(paymentId, payload)
          .then(record => {
            console.log('💡 Utility payment updated:', record);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Utility payment updated', record }));
          })
          .catch(err => {
            console.error('❌ Error updating utility payment:', err);
            res.statusCode = err.message === 'Utility payment not found' ? 404 : 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Failed to update utility payment' }));
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

  // DELETE /api/utilities/:id -> delete utility payment
  if (url.startsWith('/api/utilities/') && method === 'DELETE') {
    const paymentId = url.split('/').pop();

    deleteUtilityPayment(paymentId)
      .then(success => {
        if (success) {
          console.log('💡 Utility payment deleted:', paymentId);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Utility payment deleted' }));
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Utility payment not found' }));
        }
      })
      .catch(err => {
        console.error('❌ Error deleting utility payment:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to delete utility payment' }));
      });

    return true;
  }

  // Not handled here
  return false;
}
