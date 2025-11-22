class Order {
    constructor(data = {}) {
        this.orderID = data.orderID || null;
        this.customerID = data.customerID || null;
        this.staffID = data.staffID || null;
        this.locationName = data.locationName || null;
        this.orderDate = data.orderDate || null;
        this.wasPlacedOnline = data.wasPlacedOnline !== undefined ? data.wasPlacedOnline : false;
        this.paymentMethod = data.paymentMethod || null;
        this.usedIncentivePoints = data.usedIncentivePoints || 0;
        this.totalAmount = data.totalAmount || null;
    }

    /**
     * Validates the Order instance
     * @returns {Object} { isValid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        // CustomerID validation - optional, must be a positive integer if provided
        if (this.customerID !== null && this.customerID !== undefined) {
            const customerIDNum = parseInt(this.customerID);
            if (isNaN(customerIDNum) || customerIDNum <= 0) {
                errors.push('Customer ID must be a positive integer');
            }
        }

        // StaffID validation - optional, must be a positive integer if provided
        if (this.staffID !== null && this.staffID !== undefined) {
            const staffIDNum = parseInt(this.staffID);
            if (isNaN(staffIDNum) || staffIDNum <= 0) {
                errors.push('Staff ID must be a positive integer');
            }
        }

        // LocationName validation - optional, max 30 characters
        if (this.locationName && this.locationName.length > 30) {
            errors.push('Location name must not exceed 30 characters');
        }

        // OrderDate validation - optional, must be a valid date
        if (this.orderDate !== null && this.orderDate !== undefined) {
            const date = new Date(this.orderDate);
            if (isNaN(date.getTime())) {
                errors.push('Order date must be a valid date');
            }
        }

        // WasPlacedOnline validation - must be a boolean
        if (typeof this.wasPlacedOnline !== 'boolean') {
            errors.push('WasPlacedOnline must be a boolean value');
        }

        // PaymentMethod validation - must be one of the allowed values
        const validPaymentMethods = ['cash', 'card'];
        if (this.paymentMethod && !validPaymentMethods.includes(this.paymentMethod)) {
            errors.push(`Payment method must be one of: ${validPaymentMethods.join(', ')}`);
        }

        // UsedIncentivePoints validation - must be a non-negative integer
        if (this.usedIncentivePoints !== null && this.usedIncentivePoints !== undefined) {
            const pointsNum = parseInt(this.usedIncentivePoints);
            if (isNaN(pointsNum) || pointsNum < 0) {
                errors.push('Used incentive points must be a non-negative integer');
            }
        }

        // TotalAmount validation - required, must be a positive number with max 2 decimal places
        if (this.totalAmount === null || this.totalAmount === undefined || this.totalAmount === '') {
            errors.push('Total amount is required');
        } else {
            const totalAmountNum = parseFloat(this.totalAmount);
            if (isNaN(totalAmountNum) || totalAmountNum < 0) {
                errors.push('Total amount must be a non-negative number');
            } else if (totalAmountNum > 99999999.99) {
                errors.push('Total amount exceeds maximum allowed value (99999999.99)');
            } else {
                // Check for max 2 decimal places
                const decimalPlaces = (this.totalAmount.toString().split('.')[1] || '').length;
                if (decimalPlaces > 2) {
                    errors.push('Total amount must have at most 2 decimal places');
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Converts the Order instance to a plain object for database insertion
     * @returns {Object}
     */
    toJSON() {
        return {
            OrderID: this.orderID,
            CustomerID: this.customerID,
            StaffID: this.staffID,
            LocationName: this.locationName,
            OrderDate: this.orderDate,
            WasPlacedOnline: this.wasPlacedOnline,
            PaymentMethod: this.paymentMethod,
            UsedIncentivePoints: this.usedIncentivePoints,
            TotalAmount: this.totalAmount
        };
    }

    /**
     * Converts the Order instance to a database-compatible object (for INSERT/UPDATE)
     * Excludes null values and auto-generated fields as needed
     * @param {boolean} includeID - Whether to include OrderID (false for INSERT, true for UPDATE)
     * @returns {Object}
     */
    toDB(includeID = false) {
        const dbObj = {};

        if (includeID && this.orderID !== null) {
            dbObj.OrderID = this.orderID;
        }

        if (this.customerID !== null && this.customerID !== undefined) {
            dbObj.CustomerID = this.customerID;
        }

        if (this.staffID !== null && this.staffID !== undefined) {
            dbObj.StaffID = this.staffID;
        }

        if (this.locationName !== null && this.locationName !== undefined) {
            dbObj.LocationName = this.locationName;
        }

        if (this.orderDate !== null && this.orderDate !== undefined) {
            dbObj.OrderDate = this.orderDate;
        }

        // Always include boolean value
        dbObj.WasPlacedOnline = this.wasPlacedOnline;

        if (this.paymentMethod !== null && this.paymentMethod !== undefined) {
            dbObj.PaymentMethod = this.paymentMethod;
        }

        // Always include UsedIncentivePoints (defaults to 0)
        dbObj.UsedIncentivePoints = this.usedIncentivePoints || 0;

        if (this.totalAmount !== null && this.totalAmount !== undefined) {
            dbObj.TotalAmount = this.totalAmount;
        }

        return dbObj;
    }

    /**
     * Creates an Order instance from a database row
     * @param {Object} row - Database row object
     * @returns {Order}
     */
    static fromDB(row) {
        return new Order({
            orderID: row.OrderID,
            customerID: row.CustomerID,
            staffID: row.StaffID,
            locationName: row.LocationName,
            orderDate: row.OrderDate,
            wasPlacedOnline: Boolean(row.WasPlacedOnline),
            paymentMethod: row.PaymentMethod,
            usedIncentivePoints: row.UsedIncentivePoints,
            totalAmount: row.TotalAmount
        });
    }

    /**
     * Formats the order for API response
     * @returns {Object}
     */
    toAPIResponse() {
        return {
            orderId: this.orderID,
            customerId: this.customerID,
            staffId: this.staffID,
            locationName: this.locationName,
            orderDate: this.orderDate,
            wasPlacedOnline: this.wasPlacedOnline,
            paymentMethod: this.paymentMethod,
            usedIncentivePoints: this.usedIncentivePoints,
            totalAmount: this.totalAmount ? parseFloat(this.totalAmount).toFixed(2) : null
        };
    }

    /**
     * Creates a summary object for the order (useful for lists)
     * @returns {Object}
     */
    toSummary() {
        return {
            orderId: this.orderID,
            orderDate: this.orderDate,
            totalAmount: this.totalAmount ? parseFloat(this.totalAmount).toFixed(2) : null,
            paymentMethod: this.paymentMethod,
            wasPlacedOnline: this.wasPlacedOnline
        };
    }
}

export default Order;

import { db } from '../db/connection.js';
import OrderItemCustomization from './OrderItemCustomization.js';
import { findCustomerByPhoneNumber, findCustomerById } from './Customer.js';
import { getLocationToday } from './ActiveLocation.js';
import { getMenuItemByIds } from './MenuItem.js';
import { getCurrentWorkingStaff } from './Staff.js';
import OrderItem from './OrderItem.js';

export const createOrder = async (orderItems, phoneNumber = null, userId = null, isOnline, staffID = null, paymentMethod = "card", usedIncentivePoints = 0, totalAmount = null, locationName) => {
    
    if (!orderItems || !Array.isArray(orderItems) || !orderItems) {
        throw new Error('Invalid order data or order items');
    }
    const todayLocation = (await getLocationToday());

    console.log(todayLocation, locationName);

    if (todayLocation.filter(loc => loc.locationName == locationName).length === 0) {
        throw new Error('The specified location is not active today');
    }
    

    let orderData = {
        locationName: locationName,
        orderDate: new Date(),
        wasPlacedOnline: isOnline,
        paymentMethod: paymentMethod,
        usedIncentivePoints: usedIncentivePoints,
    }

    if (phoneNumber) {
        const customer = await findCustomerByPhoneNumber(phoneNumber);
        if (customer) {
            orderData.customerID = customer.customerID;
        }
    } else if (userId) {
        const customer = await findCustomerById(userId);
        if (customer) {
            orderData.customerID = customer.customerID;
        }
    }

    if (!isOnline) {
        orderData.staffID = staffID;
    } else {
        const staffMember = await getCurrentWorkingStaff(locationName);

        if (staffMember) {
            orderData.staffID = staffMember.staffID;
        } else {
            throw new Error('No staff member currently working at the location to assign the online order');
        }
    }

    const menuItems = await getMenuItemByIds(Array.from(new Set(orderItems.map((obj) => obj.id))));

    if (totalAmount == null) {
        let calculatedTotal = 0;
        for (let i = 0; i < orderItems.length; i++) {
            const menuItem = menuItems[orderItems[i].id];
            if (menuItem) {
                calculatedTotal += parseFloat(menuItem.Price) * (orderItems[i].quantity || 1);
            }
            if (orderItems[i].customizations && orderItems[i].customizations.length > 0) {
                let sum = 0;
                for (const customization of orderItems[i].customizations) {
                    if (customization.priceAdjustment) {
                        sum += parseFloat(customization.priceAdjustment) * (customization.quantityDelta || 1);
                    }
                }
                calculatedTotal += sum * (orderItems[i].quantity || 1);
            }
        }

        totalAmount = (calculatedTotal * 1.1).toFixed(2); // Including 1% tax
    } else {
        totalAmount = parseFloat(totalAmount);
    }
    orderData.totalAmount = totalAmount;

    const order = new Order(orderData);

    const validation = order.validate();

    if (!validation.isValid) {
        throw new Error(`Order validation failed: ${validation.errors.join(', ')}`);
    }

    const insertOrderQuery = `
        INSERT INTO pos.Order (CustomerID, StaffID, LocationName, OrderDate, WasPlacedOnline, PaymentMethod, UsedIncentivePoints, TotalAmount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const orderParams = [
        order.customerID,
        order.staffID,
        order.locationName,
        order.orderDate,
        order.wasPlacedOnline,
        order.paymentMethod,
        order.usedIncentivePoints,
        order.totalAmount
    ];

    const [results] = await db.query(insertOrderQuery, orderParams);

    const orderID = results.insertId;

    for (let i = 0; i < orderItems.length; i++) {
        const menuItem = menuItems[orderItems[i].id];
        const customizations = orderItems[i].customizations || {};

        const orderItemData = {
            orderID: orderID,
            menuItemID: menuItem ? menuItem.MenuItemID : null,
            price: isOnline ? (menuItem ? parseFloat(menuItem.Price) : 0) : (orderItems[i].price),
            quantity: orderItems[i].quantity || 1,
        }

        const neworderitem = new OrderItem(orderItemData);

        if (!neworderitem.validate().isValid) {
            throw new Error(`Order item validation failed: ${neworderitem.validate().errors.join(', ')}`);
        }

        const insertOrderItemQuery = `
            INSERT INTO pos.Order_Item (OrderID, MenuItemID, Price, Quantity)
            VALUES (?, ?, ?, ?);
        `;
        const orderItemParams = [
            orderItemData.orderID,
            orderItemData.menuItemID,
            orderItemData.price,
            orderItemData.quantity
        ];
        const [results] = await db.query(insertOrderItemQuery, orderItemParams);

        const orderItemId = results.insertId;

        if (customizations && customizations.length > 0) {
            for (const customization of customizations) {
                const c = new OrderItemCustomization({ 
                    ingredientID: customization.ingredientId, 
                    orderID: orderID, 
                    orderItemID: orderItemId,
                    changeType: customization.changeType,
                    quantityDelta: customization.quantityDelta,
                    note: customization.note || null
                });

                console.log(customization)

                if (!c.validate().isValid) {
                    throw new Error(`Order item customization validation failed: ${c.validate().errors.join(', ')}`);
                }

                db.query(`
                    INSERT INTO pos.OrderItemCustomization (OrderItemID, IngredientId, changeType, quantityDelta, priceDelta, note)
                    VALUES (?, ?, ?, ?, ?, ?);
                `, [
                    c.orderItemID,
                    c.ingredientID,
                    c.changeType,
                    c.quantityDelta,
                    c.priceDelta,
                    c.note,
                ]);
            }
        }

    }

    return orderID;
}

/**
 * Get orders by status with items and customizations
 * @param {string[]} statuses - Array of statuses to filter by
 * @param {Date} startDate - Optional start date filter
 * @param {Date} endDate - Optional end date filter
 * @returns {Promise<Array>} Array of orders with items and customizations
 */
export const getOrdersByStatus = async (statuses, startDate = null, endDate = null) => {
    const statusPlaceholders = statuses.map(() => '?').join(',');
    
    let query = `
        SELECT 
            o.OrderID, 
            o.CustomerID, 
            o.StaffID,
            o.LocationName,
            o.OrderDate,
            o.WasPlacedOnline,
            o.PaymentMethod,
            o.UsedIncentivePoints,
            o.TotalAmount,
            c.Fname as CustomerFname,
            c.Lname as CustomerLname
        FROM pos.Order o
        LEFT JOIN pos.Customer c ON o.CustomerID = c.CustomerID
        WHERE 1=1
    `;
    
    const params = [];
    
    // Add date filters if provided
    if (startDate) {
        query += ' AND o.OrderDate >= ?';
        params.push(startDate);
    }
    
    if (endDate) {
        query += ' AND o.OrderDate <= ?';
        params.push(endDate);
    }
    
    query += ' ORDER BY o.OrderDate ASC';
    
    // Single query with joins to get all data at once
    const [rows] = await db.query(`
        SELECT 
            o.OrderID, 
            o.CustomerID, 
            o.StaffID,
            o.LocationName,
            o.OrderDate,
            o.WasPlacedOnline,
            o.PaymentMethod,
            o.UsedIncentivePoints,
            o.TotalAmount,
            c.Fname as CustomerFname,
            c.Lname as CustomerLname,
            oi.OrderItemID,
            oi.MenuItemID,
            oi.Price as ItemPrice,
            oi.Quantity,
            oi.Status as ItemStatus,
            mi.Name as MenuItemName,
            oic.OrderItemCustomizationID,
            oic.changeType,
            oic.quantityDelta,
            oic.note,
            i.Name as IngredientName
        FROM pos.Order o
        LEFT JOIN pos.Customer c ON o.CustomerID = c.CustomerID
        LEFT JOIN pos.Order_Item oi ON o.OrderID = oi.OrderID
        LEFT JOIN pos.Menu_Item mi ON oi.MenuItemID = mi.MenuItemID
        LEFT JOIN pos.OrderItemCustomization oic ON oi.OrderItemID = oic.OrderItemID
        LEFT JOIN pos.Ingredient i ON oic.IngredientId = i.IngredientID
        WHERE oi.Status IN (${statusPlaceholders})
        ${startDate ? 'AND o.OrderDate >= ?' : ''}
        ${endDate ? 'AND o.OrderDate <= ?' : ''}
        ORDER BY o.OrderDate ASC, oi.OrderItemID, oic.OrderItemCustomizationID
    `, [...statuses, ...params]);
    
    // Process rows and group by order ID using a hash map
    const ordersMap = new Map();
    
    for (const row of rows) {
        const orderId = row.OrderID;
        
        // Initialize order if not exists
        if (!ordersMap.has(orderId)) {
            ordersMap.set(orderId, {
                orderId: orderId,
                customerId: row.CustomerID,
                customerName: row.CustomerFname && row.CustomerLname 
                    ? `${row.CustomerFname} ${row.CustomerLname}` 
                    : null,
                locationName: row.LocationName,
                orderDate: row.OrderDate,
                wasPlacedOnline: Boolean(row.WasPlacedOnline),
                paymentMethod: row.PaymentMethod,
                totalAmount: parseFloat(row.TotalAmount),
                items: new Map(),
                itemStatuses: []
            });
        }
        
        const order = ordersMap.get(orderId);
        
        // Add order item if exists
        if (row.OrderItemID) {
            const itemId = row.OrderItemID;
            
            if (!order.items.has(itemId)) {
                order.items.set(itemId, {
                    orderItemID: itemId,
                    menuItemID: row.MenuItemID,
                    menuItemName: row.MenuItemName,
                    quantity: row.Quantity,
                    price: parseFloat(row.ItemPrice),
                    status: row.ItemStatus,
                    customizations: []
                });
                order.itemStatuses.push(row.ItemStatus);
            }
            
            // Add customization if exists
            if (row.OrderItemCustomizationID) {
                order.items.get(itemId).customizations.push({
                    ingredientName: row.IngredientName,
                    changeType: row.changeType,
                    quantityDelta: row.quantityDelta,
                    note: row.note
                });
            }
        }
    }
    
    // Convert maps to arrays and determine overall status
    const orders = [];
    
    for (const order of ordersMap.values()) {
        // Convert items map to array
        order.items = Array.from(order.items.values());
        
        // Determine overall order status based on item statuses
        let overallStatus = 'completed';
        const itemStatuses = order.itemStatuses;
        
        // Skip orders with no items - they shouldn't be returned
        if (itemStatuses.length === 0) {
            continue;
        }
        
        if (itemStatuses.some(s => s === 'cancelled' || s === 'refunded')) {
            overallStatus = itemStatuses.includes('cancelled') ? 'cancelled' : 'refunded';
        } else if (itemStatuses.every(s => s === 'completed')) {
            overallStatus = 'completed';
        } else if (itemStatuses.some(s => s === 'in_progress')) {
            overallStatus = 'in_progress';
        } else if (itemStatuses.every(s => s === 'pending')) {
            overallStatus = 'pending';
        } else {
            overallStatus = 'in_progress';
        }
        
        order.overallStatus = overallStatus;
        
        // Remove temporary itemStatuses array
        delete order.itemStatuses;
        
        // Filter based on requested statuses
        if (statuses.includes(overallStatus)) {
            orders.push(order);
        }
    }
    
    return orders;
};

/**
 * Update order status by changing all its items' statuses
 * @param {number} orderId - Order ID
 * @param {string} newStatus - New status ('in_progress' or 'completed')
 * @returns {Promise<boolean>} Success status
 */
export const updateOrderStatus = async (orderId, newStatus) => {
    const validStatuses = ['in_progress', 'completed'];
    
    if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid status. Must be in_progress or completed');
    }
    
    // Update all order items to the new status
    await db.query(
        'UPDATE pos.Order_Item SET Status = ? WHERE OrderID = ?',
        [newStatus, orderId]
    );
    
    return true;
};

/**
 * Update a single order item's status
 * @param {number} orderItemId - Order Item ID
 * @param {string} newStatus - New status
 * @returns {Promise<boolean>} Success status
 */
export const updateOrderItemStatus = async (orderItemId, newStatus) => {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'refunded'];
    
    if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    await db.query(
        'UPDATE pos.Order_Item SET Status = ? WHERE OrderItemID = ?',
        [newStatus, orderItemId]
    );
    
    return true;
};

/**
 * Accept a pending order (changes all items to in_progress and assigns staff)
 * @param {number} orderId - Order ID
 * @param {number} staffId - Staff ID of the employee accepting the order
 * @returns {Promise<boolean>} Success status
 */
export const acceptOrder = async (orderId, staffId = null) => {
    // First check if order exists and has pending items
    const [items] = await db.query(
        'SELECT Status FROM pos.Order_Item WHERE OrderID = ?',
        [orderId]
    );
    
    if (items.length === 0) {
        throw new Error('Order not found');
    }
    
    // Update the order with staff ID if provided
    if (staffId) {
        await db.query(
            'UPDATE pos.Order SET StaffID = ? WHERE OrderID = ?',
            [staffId, orderId]
        );
    }
    
    // Update all pending items to in_progress
    await db.query(
        'UPDATE pos.Order_Item SET Status = ? WHERE OrderID = ? AND Status = ?',
        ['in_progress', orderId, 'pending']
    );
    
    return true;
};

/**
 * Complete an order (changes all items to completed)
 * @param {number} orderId - Order ID
 * @returns {Promise<boolean>} Success status
 */
export const completeOrder = async (orderId) => {
    await updateOrderStatus(orderId, 'completed');
    return true;
};

/**
 * Cancel an order (changes all items to cancelled)
 * @param {number} orderId - Order ID
 * @returns {Promise<boolean>} Success status
 */
export const cancelOrder = async (orderId) => {
    // First check if order exists
    const [items] = await db.query(
        'SELECT Status FROM pos.Order_Item WHERE OrderID = ?',
        [orderId]
    );
    
    if (items.length === 0) {
        throw new Error('Order not found');
    }
    
    // Update all items to cancelled
    await db.query(
        'UPDATE pos.Order_Item SET Status = ? WHERE OrderID = ?',
        ['cancelled', orderId]
    );
    
    return true;
};