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
                calculatedTotal += parseFloat(menuItem.Price);
            }
            if (orderItems[i].customizations && orderItems[i].customizations.length > 0) {
                for (const customization of orderItems[i].customizations) {
                    if (customization.priceAdjustment) {
                        calculatedTotal += parseFloat(customization.priceAdjustment) * (customization.quantityDelta || 1);
                    }
                }
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