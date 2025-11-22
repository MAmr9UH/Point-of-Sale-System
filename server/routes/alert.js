import { getNewAlerts, markAlertAsShown } from '../model/Alert.js';

export const handleAlerts = async (req, res) => {
  const { url, method } = req;

  // GET new/unread alerts
  if (method === 'GET' && url === '/api/alerts/new') {
    try {
      const alerts = await getNewAlerts();

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(alerts));
    } catch (err) {
      console.error('Error fetching alerts:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Failed to fetch alerts', details: err.message }));
    }
  }
  // POST mark alert as shown
  else if (method === 'POST' && url.startsWith('/api/alerts/') && url.endsWith('/mark-shown')) {
    try {
      // Extract alert ID from URL: /api/alerts/123/mark-shown
      const alertId = url.split('/')[3];

      if (!alertId) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Alert ID is required' }));
        return;
      }

      await markAlertAsShown(alertId);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      console.error('Error marking alert as shown:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Failed to update alert', details: err.message }));
    }
  }
  else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));
  }
};