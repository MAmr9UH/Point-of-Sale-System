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
            GROUP_CONCAT(CONCAT(oi.Quantity, 'x ', mi.Name) SEPARATOR ', ') as Items
     FROM \`order\` as o
     LEFT JOIN order_item oi ON o.OrderID = oi.OrderID
     LEFT JOIN menu_item mi ON oi.MenuItemID = mi.MenuItemID
     WHERE o.CustomerID = ?
     GROUP BY o.OrderID
     ORDER BY o.OrderDate DESC`,
    [customerId]
  );
  return rows;
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