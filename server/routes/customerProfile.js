import { getCustomerById, getOrdersByCustomerId, getMostOrderedItem } from '../model/CustomerProfile.js';

export const handleCustomerProfile = async (req, res) => {
  const { url, method } = req;

  const profileMatch = url.match(/^\/api\/customer\/profile\/(\d+)$/);
  
  if (method === 'GET' && profileMatch) {
    const customerId = profileMatch[1];

    try {
      const customer = await getCustomerById(customerId);
      if (!customer) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Customer not found' }));
        return;
      }

      const orders = await getOrdersByCustomerId(customerId);
      const mostOrderedItem = await getMostOrderedItem(customerId);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true, customer, orders, mostOrderedItem }));
    } catch (err) {
      console.error('Error fetching customer profile:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Failed to fetch profile', details: err.message }));
    }
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
};
