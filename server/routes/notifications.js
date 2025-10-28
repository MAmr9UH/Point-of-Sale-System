// routes/notificationRoutes.js
import { getAllNotifications, getUnreadCount, markAllAsRead } from '../model/Notifications.js';

export const handleNotificationRoutes = async (req, res) => {
  const { url, method } = req;

  // GET /api/staff/notifications - Get all notifications
  if (url === '/api/staff/notifications' && method === 'GET') {
    try {
      const notifications = await getAllNotifications();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(notifications));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to fetch notifications' }));
    }
  }

  // GET /api/staff/notifications/unread-count - Get unread count
  else if (url === '/api/staff/notifications/unread-count' && method === 'GET') {
    try {
      const count = await getUnreadCount();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ count }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to fetch unread count' }));
    }
  }

  // PUT /api/staff/notifications/read-all - Mark all as read
  else if (url === '/api/staff/notifications/read-all' && method === 'PUT') {
    try {
      await markAllAsRead();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to mark all as read' }));
    }
  }

  else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: "Not Found" }));
  }
};