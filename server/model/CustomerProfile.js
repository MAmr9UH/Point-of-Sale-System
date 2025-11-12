import { db } from '../db/connection.js';

export const getCustomerById = async (customerId) => {
  const [rows] = await db.query(
    'SELECT CustomerID, Email, Fname, Lname, PhoneNumber, IncentivePoints FROM customer WHERE CustomerID = ?',
    [customerId]
  );
  return rows[0] || null;
};

export const getOrdersByCustomerId = async (customerId) => {
  const [rows] = await db.query(
    `SELECT o.OrderID, o.OrderDate, o.TotalAmount, o.PaymentMethod, o.LocationName,
            GROUP_CONCAT(CONCAT(oi.Quantity, 'x ', mi.Name) SEPARATOR ', ') as Items,
            GROUP_CONCAT(DISTINCT oi.Status) as Statuses,
            (SELECT COUNT(*) FROM customer_feedback WHERE OrderID = o.OrderID AND CustomerID = ?) as HasFeedback
     FROM \`order\` as o
     LEFT JOIN order_item oi ON o.OrderID = oi.OrderID
     LEFT JOIN menu_item mi ON oi.MenuItemID = mi.MenuItemID
     WHERE o.CustomerID = ?
     GROUP BY o.OrderID
     ORDER BY o.OrderDate DESC`,
    [customerId, customerId]
  );
  
  // Process the status for each order
  return rows.map(order => {
    const statuses = order.Statuses ? order.Statuses.split(',') : [];
    let overallStatus = 'completed';
    
    if (statuses.includes('cancelled')) {
      overallStatus = 'cancelled';
    } else if (statuses.includes('refunded')) {
      overallStatus = 'refunded';
    } else if (statuses.every(s => s === 'completed')) {
      overallStatus = 'completed';
    } else if (statuses.some(s => s === 'in_progress')) {
      overallStatus = 'in_progress';
    } else if (statuses.every(s => s === 'pending')) {
      overallStatus = 'pending';
    } else {
      overallStatus = 'in_progress';
    }
    
    return {
      ...order,
      Status: overallStatus,
      HasFeedback: order.HasFeedback > 0
    };
  });
};

export const getMostOrderedItem = async (customerId) => {
  const [rows] = await db.query(
    `SELECT mi.Name, mi.ImageURL, SUM(oi.Quantity) as TotalOrdered
     FROM order_item as oi
     JOIN menu_item mi ON oi.MenuItemID = mi.MenuItemID
     JOIN \`order\` o ON oi.OrderID = o.OrderID
     WHERE o.CustomerID = ?
     GROUP BY mi.MenuItemID
     ORDER BY TotalOrdered DESC
     LIMIT 1`,
    [customerId]
  );
  return rows[0] || null;
};

export const submitFeedback = async (customerId, orderId, rating, comments) => {
  // Check if feedback already exists
  const [existing] = await db.query(
    'SELECT FeedbackID FROM customer_feedback WHERE CustomerID = ? AND OrderID = ?',
    [customerId, orderId]
  );
  
  if (existing.length > 0) {
    throw new Error('Feedback already submitted for this order');
  }
  
  const [result] = await db.query(
    'INSERT INTO customer_feedback (CustomerID, OrderID, Rating, Comments) VALUES (?, ?, ?, ?)',
    [customerId, orderId, rating, comments]
  );
  
  return result.insertId;
};

export const updateCustomerInfo = async (customerId, updates) => {
  const allowedFields = ['Fname', 'Lname', 'PhoneNumber', 'Email', 'OptInMarketing'];
  const fields = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }
  
  values.push(customerId);
  
  await db.query(
    `UPDATE customer SET ${fields.join(', ')} WHERE CustomerID = ?`,
    values
  );
  
  return true;
};