import { createOrder } from '../model/Order.js';
import { getLocationToday } from '../model/ActiveLocation.js';
import { withAuth, isManager, isEmployee, isCustomer } from '../utils/authMiddleware.js';

export const handleCheckout = withAuth(async (req, res) => {
  const { url, method } = req;

  // Handle staff order creation (in-store)
  if (method === 'POST' && url === '/api/checkout/staffCreateOrder') {
    if (!isEmployee(req) && !isManager(req)) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Access denied' }));
      return;
    }

    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { staffId, phoneNumber, orderItems, paymentMethod, totalAmount } = JSON.parse(body);

        if (!staffId) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Staff ID is required' }));
          return;
        }

        // Get current active location
        const locations = await getLocationToday();
        if (!locations || locations.length === 0) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'No active location today' }));
          return;
        }

        const locationName = locations[0].locationName;

        const order = await createOrder(
          orderItems,
          phoneNumber,
          null, // userId - not needed for in-store orders
          false, // isOnline
          staffId,
          paymentMethod || 'cash',
          0, // usedIncentivePoints
          totalAmount,
          locationName
        );

        console.log('Staff order created successfully:', order);

        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, order }));
      } catch (err) {
        console.error('Error creating staff order:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Failed to create order', details: err.message }));
      }
    });
  }
  // Only handle POST requests to /api/checkout/createOrder
  else if (method === 'POST' && url === '/api/checkout/userCreateOrder') {
    let body = '';

    if (!isCustomer(req)) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Access denied' }));
      return;
    }

    // Collect data chunks
    req.on('data', chunk => {
      body += chunk.toString();
    });

    // When all data is received
    req.on('end', async () => {
      try {

        const { userId, orderItems, formData } = JSON.parse(body);

        const order = await createOrder(
          orderItems,
          null,
          userId,
          true,
          null,
          "card",
          0,
          null,
          formData.pickupLocation
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
  } else if (method === 'GET' && url === '/api/checkout/getPickupLocations') {
    if (!isCustomer(req)) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Access denied' }));
      return;
    }

    try {
      const locations = await getLocationToday();

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true, locations }));
    } catch (err) {
      console.error('Error fetching pickup locations:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Failed to fetch pickup locations', details: err.message }));
    }

  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));
  }
},
  {
    "roles": ["employee", "manager", "customer"]
  }
);