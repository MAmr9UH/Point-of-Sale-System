import { getThreshold, updateThreshold } from '../model/Settings.js';

export const handleSettings = async (req, res) => {
  const { url, method } = req;

  // GET threshold
  if (method === 'GET' && url === '/api/settings/low-stock-threshold') {
    try {
      const threshold = await getThreshold();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ LowStockThreshold: threshold }));
    } catch (err) {
      console.error('Error fetching threshold:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to fetch threshold' }));
    }
  }
  // POST update threshold
  else if (method === 'POST' && url === '/api/settings/low-stock-threshold') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { threshold } = JSON.parse(body);

        if (!threshold || threshold < 1 || threshold > 30) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Threshold must be between 1 and 30' }));
          return;
        }

        await updateThreshold(threshold);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('Error updating threshold:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to update threshold' }));
      }
    });
  }
  else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));
  }
};