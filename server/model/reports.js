import { db } from '../db/connection.js';

const profitPerLocation = async (startDate, endDate, desc = false) => {
    const order = desc ? 'DESC' : 'ASC';
    const query = `
        SELECT LocationName, SUM(TotalAmount) AS TotalProfit
        FROM pos.Order
        WHERE OrderDate BETWEEN ? AND ?
        GROUP BY LocationName
        ORDER BY TotalProfit ${order};
    `;

    const [results] = await db.query(query, [startDate, endDate]);
    return results;
}

const mostPopularItems = async (startDate, endDate, desc = false) => {
    const order = desc ? 'DESC' : 'ASC';
    const query = `
        SELECT MI.Name, COUNT(OI.MenuItemID) AS OrderCount, COUNT(*) * MI.Price AS TotalRevenue
        FROM pos.Order as O, pos.Menu_Item as MI, pos.Order_Item as OI
        WHERE O.OrderID = OI.OrderID AND OI.MenuItemID = MI.MenuItemID AND O.OrderDate BETWEEN ? AND ?
        GROUP BY OI.MenuItemID
        ORDER BY OrderCount ${order};
    `;

    const [results] = await db.query(query, [startDate, endDate]);
    console.log(results)

    return results;
}

const employeePerformance = async (startDate, endDate, desc = false) => {
    const order = desc ? 'DESC' : 'ASC';
    const query = `
        SELECT E.FName, E.lname,  COUNT(O.OrderID) AS OrdersHandled, SUM(O.TotalAmount) AS TotalSales, SUM(T.ClockOutTime - T.ClockInTime) AS TotalHoursWorked
        FROM Staff AS E
        JOIN \`Order\` AS O ON E.StaffID = O.StaffID
        JOIN Timecard as T ON T.StaffID = E.StaffID
        WHERE  T.StaffID = E.StaffID AND  T.ClockOutTime is NOT NULL
        GROUP BY (E.StaffID)
        ORDER BY TotalSales ${order};
    `;

    const [results] = await db.query(query, [startDate, endDate, startDate, endDate]);
    return results;
}   

export { profitPerLocation, mostPopularItems, employeePerformance };