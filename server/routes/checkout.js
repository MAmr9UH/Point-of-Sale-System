import { db } from '../db/connection.js'; 

export const handleCheckout = async (req, res) => {
  const { url, method } = req;

  // Only handle POST requests to /api/checkout/createOrder
  if (method === 'POST' && url === '/api/checkout/createOrder') {
    let body = '';

    // Collect the request body data
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { userId, items, total, formData } = JSON.parse(body);

        db.query(
          `INSERT INTO order_ 
          (CustomerID, StaffID, LocationName, OrderDate, WasPlacedOnline, 
           PaymentMethod, UsedIncentivePoints, TotalAmount)
          VALUES (?, ?, ?, NOW(), 1, ?, ?, ?)`,
          [
            userId,           // CustomerID
            null,             // StaffID (null for online orders)
            'Online Order',   // LocationName
            'card',           // PaymentMethod
            0,                // UsedIncentivePoints
            total             // TotalAmount
          ],
          (err, result) => { 
            if (err) {
              console.error('Error creating order:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Database error' }));
              return;
            }

            const orderId = result.insertId;

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, orderId }));
          }
        );

      } catch (err) {
        console.error('Error parsing request:', err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
      }
    });
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));
  }
};