import { createOrder } from '../model/Order.js';

export const handleCheckout = async (req, res) => {
  const { url, method } = req;

  // Only handle POST requests to /api/checkout/createOrder
  if (method === 'POST' && url === '/api/checkout/userCreateOrder') {
    let body = '';

    // Collect data chunks
    req.on('data', chunk => {
      body += chunk.toString();
    });

    // When all data is received
    req.on('end', async () => {
      try {

        const { userId, orderItems } = JSON.parse(body);

        const order = await createOrder(
          orderItems,
          null,
          userId,
          true,
          null,
          "card",
          0,
          null
        );

        console.log('Order created successfully:', order);

        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, order }));
      } catch (err) {
        console.error('Error creating order:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Failed to create order', details: err.message }));
      }
    });
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));
  }
};