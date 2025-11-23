import {db} from '../db/connection.js';
import { withAuth } from '../utils/authMiddleware.js';

/**
 * Handle location-related API requests
 */
export const handleLocationRoutes = withAuth(async (req, res) => {
  const { url, method } = req;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // GET /api/locations -> fetch all locations
    if (url === '/api/locations' && method === 'GET') {
      const [rows] = await db.query('SELECT * FROM Location ORDER BY Name');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(rows));
      return;
    }

    // GET /api/locations/active -> fetch all active locations
    if (url === '/api/locations/active' && method === 'GET') {
      const [rows] = await db.query(`
        SELECT 
          al.ActiveLocationID,
          al.LocationName,
          al.BeginOperationOn,
          al.EndOperationOn,
          al.DaysOfWeek
        FROM Active_Location al
        WHERE al.is_deleted = FALSE
        ORDER BY al.BeginOperationOn DESC
      `);
      
      // Parse DaysOfWeek from SET to array
      const parsedRows = rows.map(row => ({
        ...row,
        DaysOfWeek: row.DaysOfWeek ? row.DaysOfWeek.split(',') : []
      }));
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(parsedRows));
      return;
    }

    // POST /api/locations -> create new location
    if (url === '/api/locations' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const { Name, Address, DailyFee, HostPhoneNumber, HostEmail } = JSON.parse(body);

          if (!Name || !Address) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Name and Address are required' }));
            return;
          }

          await db.query(
            `INSERT INTO Location (Name, Address, DailyFee, HostPhoneNumber, HostEmail)
             VALUES (?, ?, ?, ?, ?)`,
            [Name, Address, DailyFee || 0, HostPhoneNumber || null, HostEmail || null]
          );

          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Location created successfully' }));
        } catch (error) {
          console.error('Error creating location:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            error: error.code === 'ER_DUP_ENTRY' 
              ? 'Location name already exists' 
              : 'Failed to create location' 
          }));
        }
      });
      return;
    }

    // POST /api/locations/active -> create new active location contract
    if (url === '/api/locations/active' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const { LocationName, BeginOperationOn, EndOperationOn, DaysOfWeek } = JSON.parse(body);

          if (!LocationName || !BeginOperationOn || !DaysOfWeek || DaysOfWeek.length === 0) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              error: 'LocationName, BeginOperationOn, and at least one day are required' 
            }));
            return;
          }

          // Convert array to SET string
          const daysString = DaysOfWeek.join(',');

          await db.query(
            `INSERT INTO Active_Location (LocationName, BeginOperationOn, EndOperationOn, DaysOfWeek)
             VALUES (?, ?, ?, ?)`,
            [LocationName, BeginOperationOn, EndOperationOn || null, daysString]
          );

          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Active location contract created successfully' }));
        } catch (error) {
          console.error('Error creating active location:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to create active location contract' }));
        }
      });
      return;
    }

    // PUT /api/locations/:name -> update location
    if (url.startsWith('/api/locations/') && !url.includes('/active') && method === 'PUT') {
      const locationName = decodeURIComponent(url.split('/api/locations/')[1]);

      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const { Address, DailyFee, HostPhoneNumber, HostEmail } = JSON.parse(body);

          await db.query(
            `UPDATE Location 
             SET Address = ?, DailyFee = ?, HostPhoneNumber = ?, HostEmail = ?
             WHERE Name = ?`,
            [Address, DailyFee || 0, HostPhoneNumber || null, HostEmail || null, locationName]
          );

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Location updated successfully' }));
        } catch (error) {
          console.error('Error updating location:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to update location' }));
        }
      });
      return;
    }

    // PUT /api/locations/active/:id -> update active location contract
    if (url.startsWith('/api/locations/active/') && method === 'PUT') {
      const activeLocationId = url.split('/api/locations/active/')[1];

      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const { LocationName, BeginOperationOn, EndOperationOn, DaysOfWeek } = JSON.parse(body);

          if (!LocationName || !BeginOperationOn || !DaysOfWeek || DaysOfWeek.length === 0) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              error: 'LocationName, BeginOperationOn, and at least one day are required' 
            }));
            return;
          }

          // Convert array to SET string
          const daysString = DaysOfWeek.join(',');

          await db.query(
            `UPDATE Active_Location 
             SET LocationName = ?, BeginOperationOn = ?, EndOperationOn = ?, DaysOfWeek = ?
             WHERE ActiveLocationID = ? AND is_deleted = FALSE`,
            [LocationName, BeginOperationOn, EndOperationOn || null, daysString, activeLocationId]
          );

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Active location contract updated successfully' }));
        } catch (error) {
          console.error('Error updating active location:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to update active location contract' }));
        }
      });
      return;
    }

    // DELETE /api/locations/:name -> delete location
    if (url.startsWith('/api/locations/') && !url.includes('/active') && method === 'DELETE') {
      const locationName = decodeURIComponent(url.split('/api/locations/')[1]);

      try {
        await db.query('DELETE FROM Location WHERE Name = ?', [locationName]);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Location deleted successfully' }));
      } catch (error) {
        console.error('Error deleting location:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          error: error.code === 'ER_ROW_IS_REFERENCED_2' 
            ? 'Cannot delete location with existing contracts or references' 
            : 'Failed to delete location' 
        }));
      }
      return;
    }

    // DELETE /api/locations/active/:id -> delete active location contract
    if (url.startsWith('/api/locations/active/') && method === 'DELETE') {
      const activeLocationId = url.split('/api/locations/active/')[1];

      try {
        await db.query('UPDATE Active_Location SET is_deleted = TRUE WHERE ActiveLocationID = ?', [activeLocationId]);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Active location contract deleted successfully' }));
      } catch (error) {
        console.error('Error deleting active location:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to delete active location contract' }));
      }
      return;
    }

    // Route not found
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Route not found' }));

  } catch (error) {
    console.error('Error in location routes:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}, {
  roles: ["manager"]
});