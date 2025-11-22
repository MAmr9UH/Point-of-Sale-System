import {db} from '../db/connection.js';
import { withAuth, getAuthStaffId, isEmployee, verifyOwnership } from '../utils/authMiddleware.js';

const timecardHandler = async (req, res) => {
  const { url, method } = req;

  // Get timecard data for a staff member
  if (method === 'GET' && url.match(/^\/api\/timecard\/staff\/\d+$/)) {
    const staffId = url.split('/').pop();

    // Employees can only view their own timecard, managers can view any
    if (isEmployee(req) && !verifyOwnership(req, res, staffId)) {
      return;
    }

    try {
      // Get active timecard (not clocked out)
      const [activeResults] = await db.execute(
        'SELECT * FROM Timecard WHERE StaffID = ? AND ClockOutTime IS NULL ORDER BY ClockInTime DESC LIMIT 1',
        [staffId]
      );

      // Get recent timecards (last 10)
      const [recentResults] = await db.execute(
        'SELECT * FROM Timecard WHERE StaffID = ? AND ClockOutTime IS NOT NULL ORDER BY ClockInTime DESC LIMIT 10',
        [staffId]
      );

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        active: activeResults.length > 0 ? activeResults[0] : null,
        recent: recentResults
      }));
    } catch (error) {
      console.error('Error fetching timecard:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to fetch timecard data', details: error.message }));
    }
  }
  // Clock in
  else if (method === 'POST' && url === '/api/timecard/clockin') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { staffId } = JSON.parse(body);

        if (!staffId) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Staff ID is required' }));
          return;
        }

        // Employees can only clock in for themselves, managers can clock in for any staff
        if (isEmployee(req) && !verifyOwnership(req, res, staffId)) {
          return;
        }

        // Check if already clocked in
        const [activeCheck] = await db.execute(
          'SELECT * FROM Timecard WHERE StaffID = ? AND ClockOutTime IS NULL',
          [staffId]
        );

        if (activeCheck.length > 0) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Already clocked in' }));
          return;
        }

        // Get current active location
        const [locationResults] = await db.execute(`
          SELECT LocationName 
          FROM Active_Location 
          WHERE EndOperationOn IS NULL 
          ORDER BY BeginOperationOn DESC 
          LIMIT 1
        `);

        if (locationResults.length === 0) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'No active location found' }));
          return;
        }

        const locationName = locationResults[0].LocationName;

        // Insert new timecard
        const [result] = await db.execute(
          'INSERT INTO Timecard (StaffID, LocationName, ClockInTime) VALUES (?, ?, NOW())',
          [staffId, locationName]
        );

        // Get the newly created timecard
        const [newTimecard] = await db.execute(
          'SELECT * FROM Timecard WHERE TimecardID = ?',
          [result.insertId]
        );

        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          message: 'Successfully clocked in',
          timecard: newTimecard[0]
        }));
      } catch (error) {
        console.error('Error clocking in:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to clock in', details: error.message }));
      }
    });
  }
  // Clock out
  else if (method === 'POST' && url === '/api/timecard/clockout') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { timecardId } = JSON.parse(body);

        if (!timecardId) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Timecard ID is required' }));
          return;
        }

        // Get timecard to verify ownership
        const [timecardResults] = await db.execute(
          'SELECT * FROM Timecard WHERE TimecardID = ?',
          [timecardId]
        );

        if (timecardResults.length === 0) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Timecard not found' }));
          return;
        }

        const timecard = timecardResults[0];

        // Employees can only clock out their own timecard, managers can clock out any
        if (isEmployee(req) && !verifyOwnership(req, res, timecard.StaffID)) {
          return;
        }

        if (timecard.ClockOutTime) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Already clocked out' }));
          return;
        }

        // Calculate total hours
        const clockInTime = new Date(timecard.ClockInTime);
        const clockOutTime = new Date();
        const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

        // Update timecard
        await db.execute(
          'UPDATE Timecard SET ClockOutTime = NOW(), TotalHours = ? WHERE TimecardID = ?',
          [totalHours.toFixed(2), timecardId]
        );

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          message: 'Successfully clocked out',
          totalHours: totalHours.toFixed(2)
        }));
      } catch (error) {
        console.error('Error clocking out:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to clock out', details: error.message }));
      }
    });
  }
  else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));
  }
};

// Export with JWT authentication - employees and managers only
export const handleTimecard = withAuth(timecardHandler, {
  roles: ['employee', 'manager']
});
