import {db} from '../db/connection.js';

export async function getAllNotifications() {
  try {
    const [notifications] = await db.query(
      `SELECT 
        NotificationID, 
        Message, 
        CreatedAt, 
        Status 
      FROM notifications 
      ORDER BY CreatedAt DESC 
      LIMIT 50`
    );
    return notifications;
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    throw error;
  }
}

export async function getUnreadCount() {
  try {
    const [result] = await db.query(
      "SELECT COUNT(*) as count FROM notifications WHERE Status = 'unread'"
    );
    return parseInt(result[0].count);
  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    throw error;
  }
}

export async function markAllAsRead() {
  try {
    await db.query(
      "UPDATE notifications SET Status = 'read' WHERE Status = 'unread'"
    );
    return true;
  } catch (error) {
    console.error('❌ Error marking all as read:', error);
    throw error;
  }
}