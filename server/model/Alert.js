import { db } from '../db/connection.js';

// Get all open/unread alerts
export const getNewAlerts = async () => {
  try {
    const [alerts] = await db.query(
      'SELECT * FROM Alert WHERE is_open = TRUE ORDER BY CreatedAt DESC'
    );
    return alerts;
  } catch (error) {
    console.error('Error fetching new alerts:', error);
    throw error;
  }
};

// Mark alert as shown/closed
export const markAlertAsShown = async (alertId) => {
  try {
    const [result] = await db.query(
      'UPDATE Alert SET is_open = FALSE WHERE AlertID = ?',
      [alertId]
    );
    return result;
  } catch (error) {
    console.error('Error marking alert as shown:', error);
    throw error;
  }
};