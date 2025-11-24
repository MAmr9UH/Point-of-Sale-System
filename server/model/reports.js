import { db } from '../db/connection.js';

/*
  reports.js
    1) profitPerLocation(startDate, endDate, desc)
    2) mostPopularItems(startDate, endDate, desc)
    3) employeePerformance(startDate, endDate, desc)
  
*/

/**
 * Most profitable location
 * - Calculates per-location metrics for a date range:
 *   LocationName, TotalOrders, TotalSales, TotalCost, TotalProfit, ProfitMarginPct
 * - TotalCost is composed of:
 *     ingredient costs derived from order items × recipe quantities × ingredient cost
 *     PLUS utility payments (deduplicated per location/year)
 * - Uses LEFT JOINs so locations with missing components still appear (costs default to 0)
 * - Groups by location and orders by TotalProfit
 */
const profitPerLocation = async (startDate, endDate, desc = false) => {
  const order = desc ? 'DESC' : 'ASC';
  const query = `
    SELECT
      orders.LocationName                             AS LocationName,
      COUNT(DISTINCT orders.OrderID)                  AS TotalOrders,
      
      /* Calculate sales from order_item table to avoid duplication */
      (
        SELECT SUM(IFNULL(oi.Quantity * oi.Price, 0))
        FROM order_item oi
        WHERE oi.OrderID IN (
          SELECT o2.OrderID 
          FROM \`order\` o2 
          WHERE o2.LocationName = orders.LocationName
            AND o2.OrderDate BETWEEN ? AND ?
        )
      )                                               AS TotalSales,

      (
        /* ingredient costs:
           sum over each order_item: quantity * quantityRequired (recipe) * ingredient cost */
        SUM(
          IFNULL(order_items.Quantity, 0)
          * IFNULL(used_for.QuantityRequired, 0)
          * IFNULL(ingredients.CostPerUnit, 0)
        )
        /* plus utility payments for the location (deduplicated with DISTINCT) */
        +
        SUM(DISTINCT IFNULL(utility_payments.Amount, 0))
      )                                                AS TotalCost,

      /* profit = sales - cost */
      (
        SELECT SUM(IFNULL(oi.Quantity * oi.Price, 0))
        FROM order_item oi
        WHERE oi.OrderID IN (
          SELECT o2.OrderID 
          FROM \`order\` o2 
          WHERE o2.LocationName = orders.LocationName
            AND o2.OrderDate BETWEEN ? AND ?
        )
      )
        - (
            SUM(
              IFNULL(order_items.Quantity, 0)
              * IFNULL(used_for.QuantityRequired, 0)
              * IFNULL(ingredients.CostPerUnit, 0)
            )
            +
            SUM(DISTINCT IFNULL(utility_payments.Amount, 0))
          )                                              AS TotalProfit,

      /* profit margin as percentage (safely handle zero sales) */
      ROUND(
        CASE
          WHEN (
            SELECT SUM(IFNULL(oi.Quantity * oi.Price, 0))
            FROM order_item oi
            WHERE oi.OrderID IN (
              SELECT o2.OrderID 
              FROM \`order\` o2 
              WHERE o2.LocationName = orders.LocationName
                AND o2.OrderDate BETWEEN ? AND ?
            )
          ) > 0 THEN
            (
              (
                SELECT SUM(IFNULL(oi.Quantity * oi.Price, 0))
                FROM order_item oi
                WHERE oi.OrderID IN (
                  SELECT o2.OrderID 
                  FROM \`order\` o2 
                  WHERE o2.LocationName = orders.LocationName
                    AND o2.OrderDate BETWEEN ? AND ?
                )
              ) -
              (
                SUM(
                  IFNULL(order_items.Quantity, 0)
                  * IFNULL(used_for.QuantityRequired, 0)
                  * IFNULL(ingredients.CostPerUnit, 0)
                )
                +
                SUM(DISTINCT IFNULL(utility_payments.Amount, 0))
              )
            ) / (
              SELECT SUM(IFNULL(oi.Quantity * oi.Price, 0))
              FROM order_item oi
              WHERE oi.OrderID IN (
                SELECT o2.OrderID 
                FROM \`order\` o2 
                WHERE o2.LocationName = orders.LocationName
                  AND o2.OrderDate BETWEEN ? AND ?
              )
            ) * 100
          ELSE 0
        END, 2
      )                                                AS ProfitMarginPct

    FROM \`order\` AS orders

    /* join to order items so we can compute ingredient consumption */
    LEFT JOIN \`order_item\` AS order_items
           ON order_items.OrderID = orders.OrderID

    /* used_for links menu items to ingredients and required quantities (the recipe) */
    LEFT JOIN \`used_for\` AS used_for
           ON used_for.MenuItemID = order_items.MenuItemID

    /* ingredient contains CostPerUnit used in cost calc */
    LEFT JOIN \`ingredient\` AS ingredients
           ON ingredients.IngredientID = used_for.IngredientID

    /* utility payments per location; restrict to same year as order using YEAR() */
    LEFT JOIN \`utility_payment\` AS utility_payments
           ON utility_payments.LocationName = orders.LocationName
              AND YEAR(utility_payments.PaymentDate) = YEAR(orders.OrderDate)

    /* restrict to provided date range (outer WHERE uses parameters) */
    WHERE orders.OrderDate BETWEEN ? AND ?
    GROUP BY orders.LocationName
    ORDER BY TotalProfit ${order};
  `;

  const params = [startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate];
  const [results] = await db.query(query, params);
  return results;
}

/**
 * Most popular items
 * - Aggregates order items for the date range to compute per-item:
 *   ItemName, Category, TotalQuantity, TotalSales, AvgPricePerItem, SalesSharePct
 * - SalesSharePct is percent of overall sales in the date range (subquery t)
 * - Uses a subquery (t) to compute GrandTotalSales for the same period, used to compute share%
 */
const mostPopularItems = async (startDate, endDate, desc = false) => {
  const order = desc ? 'DESC' : 'ASC';
  const query = `
    SELECT
      mi.Name                                   AS ItemName,
      mi.Category                               AS Category,
      SUM(oi.Quantity)                          AS TotalQuantity,
      SUM(oi.Quantity * IFNULL(oi.Price, 0))    AS TotalSales,
      AVG(IFNULL(oi.Price, 0))                  AS AvgPricePerItem,

      /* percent of total sales: item sales / grand total sales (multiplied by 100) */
      ROUND(
        100 * SUM(oi.Quantity * IFNULL(oi.Price, 0)) / NULLIF(t.GrandTotalSales, 0),
        2
      )                                         AS SalesSharePct

    FROM order_item oi
    JOIN \`order\` o     ON o.OrderID     = oi.OrderID
    JOIN menu_item mi   ON mi.MenuItemID = oi.MenuItemID

    /* Subquery to compute grand total sales across the same date range.
       This allows calculating each item's share of total sales. */
    JOIN (
      SELECT SUM(oi2.Quantity * IFNULL(oi2.Price, 0)) AS GrandTotalSales
      FROM order_item oi2
      JOIN \`order\` o2 ON o2.OrderID = oi2.OrderID
      WHERE o2.OrderDate >= ? AND o2.OrderDate < DATE_ADD(?, INTERVAL 1 DAY)
    ) t

    WHERE o.OrderDate >= ? AND o.OrderDate < DATE_ADD(?, INTERVAL 1 DAY)

    GROUP BY mi.MenuItemID, mi.Name, mi.Category, t.GrandTotalSales
    ORDER BY TotalSales ${order};
  `;

  // params: subquery start/end, then outer start/end
  const params = [startDate, endDate, startDate, endDate];
  const [results] = await db.query(query, params);

  return results;
}

/**
 * Employee performance
 * - Builds two small aggregated subqueries:
 *   1) orders_year: per-staff total orders and sum of sales for current year (I am thinking calendar year because most likely staff will change)
 *   2) timecards_year: per-staff total hours worked for current year
 * - LEFT JOINs those aggregates to staff table so staff without orders/timecards are included
 * - Computes SalesPerHour = total_sales / total_hours (safe when total_hours = 0)
 * - Filters out Admins in this example (optional business rule)
 */
const employeePerformance = async (startDate, endDate, desc = false) => {
  const order = desc ? 'DESC' : 'ASC';
  const query = `
    SELECT
      CONCAT(staff.Fname, ' ', staff.Lname)                     AS EmployeeName,
      staff.Role                                                AS Role,
      IFNULL(orders_filtered.total_orders, 0)                   AS TotalOrdersHandled,
      IFNULL(orders_filtered.total_sales, 0.00)                 AS TotalSales,
      IFNULL(timecards_filtered.total_hours, 0.00)              AS TotalHoursWorked,
      ROUND(
        CASE 
          WHEN IFNULL(timecards_filtered.total_hours, 0) >= 1.0
            THEN IFNULL(orders_filtered.total_sales, 0) / timecards_filtered.total_hours
          WHEN IFNULL(timecards_filtered.total_hours, 0) > 0 AND IFNULL(timecards_filtered.total_hours, 0) < 1.0
            THEN IFNULL(orders_filtered.total_sales, 0) / 1.0
          ELSE 0
        END
      , 2)                                                      AS SalesPerHour
    FROM staff AS staff

    /* per-staff orders aggregation for the selected date range */
    LEFT JOIN (
      SELECT
        o.StaffID,
        COUNT(DISTINCT o.OrderID)            AS total_orders,
        SUM(IFNULL(oi.Quantity * oi.Price, 0)) AS total_sales
      FROM \`order\` AS o
      LEFT JOIN order_item oi ON oi.OrderID = o.OrderID
      WHERE o.OrderDate >= ? AND o.OrderDate < DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY o.StaffID
    ) AS orders_filtered
      ON orders_filtered.StaffID = staff.StaffID

    /* per-staff timecards aggregation (hours) for the selected date range */
    LEFT JOIN (
      SELECT
        t.StaffID,
        SUM(IFNULL(
          ROUND(TIMESTAMPDIFF(MINUTE, t.ClockInTime, t.ClockOutTime) / 60.0, 2),
          0
        )) AS total_hours
      FROM timecard AS t
      WHERE DATE(t.ClockInTime) >= ? AND DATE(t.ClockInTime) < DATE_ADD(?, INTERVAL 1 DAY)
        AND t.ClockOutTime IS NOT NULL
        AND t.ClockOutTime > t.ClockInTime
      GROUP BY t.StaffID
    ) AS timecards_filtered
      ON timecards_filtered.StaffID = staff.StaffID

    /* optional rule: exclude admin users from the report */
    WHERE staff.Role <> 'Admin'
    /* primary sort by SalesPerHour then by TotalSales */
    ORDER BY SalesPerHour ${order}, TotalSales ${order};
  `;

  const [results] = await db.query(query, [startDate, endDate, startDate, endDate]);
  return results;
}

/**
 * Raw transactions for locations report
 * - Returns individual orders (not aggregated) for the date range
 * - Shows: OrderID, OrderDate, LocationName, TotalAmount, TotalCost, StaffName (or "Online")
 * - Includes pagination with limit and offset
 * - Returns: { data: [...], total: count, page: current, pages: total_pages }
 */
const rawTransactionsLocations = async (startDate, endDate, page = 1, limit = 100) => {
  const offset = (page - 1) * limit;
  
  // Query to get paginated orders with item count and payment method
  const dataQuery = `
    SELECT
      o.OrderID,
      o.OrderDate,
      o.LocationName,
      IFNULL(SUM(oi.Quantity * oi.Price), 0) AS TotalAmount,
      IFNULL(SUM(oi.Quantity), 0) AS ItemCount,
      o.PaymentMethod,
      CASE
        WHEN o.StaffID IS NOT NULL THEN CONCAT(s.Fname, ' ', s.Lname)
        ELSE 'Online'
      END AS StaffName
    FROM \`order\` o
    LEFT JOIN staff s ON s.StaffID = o.StaffID
    LEFT JOIN order_item oi ON oi.OrderID = o.OrderID
    WHERE o.OrderDate >= ? AND o.OrderDate < DATE_ADD(?, INTERVAL 1 DAY)
    GROUP BY o.OrderID
    ORDER BY o.OrderDate DESC
    LIMIT ? OFFSET ?
  `;
  
  // Query to get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM \`order\` o
    WHERE o.OrderDate >= ? AND o.OrderDate < DATE_ADD(?, INTERVAL 1 DAY)
  `;
  
  const [dataResults] = await db.query(dataQuery, [startDate, endDate, limit, offset]);
  const [countResults] = await db.query(countQuery, [startDate, endDate]);
  
  // Debug: Log first few results to check data
  console.log("Raw transactions sample:", dataResults.slice(0, 3));
  
  const total = countResults[0].total;
  const totalPages = Math.ceil(total / limit);
  
  return {
    data: dataResults,
    pagination: {
      total: total,
      page: page,
      pages: totalPages,
      limit: limit
    }
  };
}

/**
 * Raw transactions for Menu Items report
 * Shows individual order items with details
 */
const rawTransactionsItems = async (startDate, endDate, page = 1, limit = 100) => {
  const offset = (page - 1) * limit;
  
  // Query to get paginated order items
  const dataQuery = `
    SELECT
      oi.OrderItemID,
      oi.OrderID,
      o.OrderDate,
      mi.Name AS ItemName,
      mi.Category,
      oi.Quantity,
      oi.Price AS UnitPrice,
      (oi.Quantity * oi.Price) AS LineTotal,
      o.LocationName,
      CASE
        WHEN o.StaffID IS NOT NULL THEN CONCAT(s.Fname, ' ', s.Lname)
        ELSE 'Online'
      END AS StaffName
    FROM order_item oi
    JOIN \`order\` o ON o.OrderID = oi.OrderID
    LEFT JOIN staff s ON s.StaffID = o.StaffID
    LEFT JOIN menu_item mi ON mi.MenuItemID = oi.MenuItemID
    WHERE o.OrderDate >= ? AND o.OrderDate < DATE_ADD(?, INTERVAL 1 DAY)
    ORDER BY o.OrderDate DESC, oi.OrderItemID DESC
    LIMIT ? OFFSET ?
  `;
  
  // Query to get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM order_item oi
    JOIN \`order\` o ON o.OrderID = oi.OrderID
    WHERE o.OrderDate >= ? AND o.OrderDate < DATE_ADD(?, INTERVAL 1 DAY)
  `;
  
  const [dataResults] = await db.query(dataQuery, [startDate, endDate, limit, offset]);
  const [countResults] = await db.query(countQuery, [startDate, endDate]);
  
  // Debug: Log first few results
  console.log("Raw transactions items sample:", dataResults.filter(item => item.ItemName.startsWith("Loaded")));
  
  const total = countResults[0].total;
  const totalPages = Math.ceil(total / limit);
  
  return {
    data: dataResults,
    pagination: {
      total: total,
      page: page,
      pages: totalPages,
      limit: limit
    }
  };
}

/**
 * Raw transactions for Employee Performance report
 * Shows individual timecards with order activity during shifts
 */
const rawTransactionsEmployees = async (startDate, endDate, page = 1, limit = 100) => {
  const offset = (page - 1) * limit;
  
  // Query to get paginated timecards with order activity
  const dataQuery = `
    SELECT
      t.TimecardID,
      t.StaffID AS EmployeeID,
      CONCAT(s.Fname, ' ', s.Lname) AS EmployeeName,
      s.Role,
      DATE(t.ClockInTime) AS ShiftDate,
      t.ClockInTime,
      t.ClockOutTime,
      ROUND(TIMESTAMPDIFF(MINUTE, t.ClockInTime, t.ClockOutTime) / 60.0, 2) AS HoursWorked,
      t.LocationName,
      COUNT(DISTINCT o.OrderID) AS OrdersHandled,
      IFNULL(SUM(oi.Quantity * oi.Price), 0) AS TotalSales
    FROM timecard t
    JOIN staff s ON s.StaffID = t.StaffID
    LEFT JOIN \`order\` o ON o.StaffID = t.StaffID 
      AND DATE(o.OrderDate) = DATE(t.ClockInTime)
    LEFT JOIN order_item oi ON oi.OrderID = o.OrderID
    WHERE DATE(t.ClockInTime) >= ? AND DATE(t.ClockInTime) < DATE_ADD(?, INTERVAL 1 DAY)
      AND t.ClockOutTime IS NOT NULL
      AND t.ClockOutTime > t.ClockInTime
      AND TIMESTAMPDIFF(MINUTE, t.ClockInTime, t.ClockOutTime) >= 15
    GROUP BY t.TimecardID, t.StaffID, s.Fname, s.Lname, s.Role, t.ClockInTime, t.ClockOutTime, t.LocationName
    ORDER BY t.ClockInTime DESC
    LIMIT ? OFFSET ?
  `;
  
  // Query to get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM timecard t
    WHERE DATE(t.ClockInTime) >= ? AND DATE(t.ClockInTime) < DATE_ADD(?, INTERVAL 1 DAY)
  `;
  
  const [dataResults] = await db.query(dataQuery, [startDate, endDate, limit, offset]);
  const [countResults] = await db.query(countQuery, [startDate, endDate]);
  
  // Debug: Log first few results
  console.log("Raw transactions employees sample:", dataResults.slice(0, 3));
  
  const total = countResults[0].total;
  const totalPages = Math.ceil(total / limit);
  
  return {
    data: dataResults,
    pagination: {
      total: total,
      page: page,
      pages: totalPages,
      limit: limit
    }
  };
}

export { profitPerLocation, mostPopularItems, employeePerformance, rawTransactionsLocations, rawTransactionsItems, rawTransactionsEmployees };