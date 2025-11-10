import { db } from '../db/connection.js';

export const handleBusyStatus = async (req, res) => {
  const { url, method } = req;

  // GET /api/busy-status
  if (method === 'GET' && url === '/api/busy-status') {
    try {
      const [rows] = await db.query(
        'SELECT is_busy, pending_order_count FROM busy_status WHERE id = 1'
      );
      
      if (rows.length > 0) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          isBusy: rows[0].is_busy === 1,
          pendingCount: rows[0].pending_order_count
        }));
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          success: false, 
          error: 'Status not found' 
        }));
      }
    } catch (err) {
      console.error('Error fetching busy status:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch busy status', 
        details: err.message 
      }));
    }
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));
  }
};