class OrderItem {
    constructor(data = {}) {
        this.orderItemID = data.orderItemID || null;
        this.orderID = data.orderID || null;
        this.menuItemID = data.menuItemID || null;
        this.quantity = data.quantity !== undefined ? data.quantity : 1;
        this.price = data.price || null;
        this.status = data.status || 'pending';
    }

    /**
     * Validates the OrderItem instance
     * @returns {Object} { isValid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        // OrderID validation - required, must be a positive integer
        if (this.orderID === null || this.orderID === undefined || this.orderID === '') {
            errors.push('Order ID is required');
        } else {
            const orderIDNum = parseInt(this.orderID);
            if (isNaN(orderIDNum) || orderIDNum <= 0) {
                errors.push('Order ID must be a positive integer');
            }
        }

        // MenuItemID validation - required, must be a positive integer
        if (this.menuItemID === null || this.menuItemID === undefined || this.menuItemID === '') {
            errors.push('Menu Item ID is required');
        } else {
            const menuItemIDNum = parseInt(this.menuItemID);
            if (isNaN(menuItemIDNum) || menuItemIDNum <= 0) {
                errors.push('Menu Item ID must be a positive integer');
            }
        }

        // Quantity validation - required, must be a positive integer
        if (this.quantity === null || this.quantity === undefined || this.quantity === '') {
            errors.push('Quantity is required');
        } else {
            const quantityNum = parseInt(this.quantity);
            if (isNaN(quantityNum) || quantityNum <= 0) {
                errors.push('Quantity must be a positive integer');
            }
        }

        // Price validation - required, must be a non-negative number with max 2 decimal places
        if (this.price === null || this.price === undefined || this.price === '') {
            errors.push('Price is required');
        } else {
            const priceNum = parseFloat(this.price);
            if (isNaN(priceNum) || priceNum < 0) {
                errors.push('Price must be a non-negative number');
            } else if (priceNum > 99999999.99) {
                errors.push('Price exceeds maximum allowed value (99999999.99)');
            } else {
                // Check for max 2 decimal places
                const decimalPlaces = (this.price.toString().split('.')[1] || '').length;
                if (decimalPlaces > 2) {
                    errors.push('Price must have at most 2 decimal places');
                }
            }
        }

        // Status validation - must be one of the allowed values
        const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'refunded'];
        if (!this.status || this.status.trim() === '') {
            errors.push('Status is required');
        } else if (!validStatuses.includes(this.status)) {
            errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Converts the OrderItem instance to a plain object for JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            OrderItemID: this.orderItemID,
            OrderID: this.orderID,
            MenuItemID: this.menuItemID,
            Quantity: this.quantity,
            Price: this.price,
            Status: this.status
        };
    }

    /**
     * Converts the OrderItem instance to a database-compatible object
     * Excludes null values and auto-generated fields as needed
     * @param {boolean} includeID - Whether to include OrderItemID (false for INSERT, true for UPDATE)
     * @returns {Object}
     */
    toDB(includeID = false) {
        const dbObj = {};

        if (includeID && this.orderItemID !== null) {
            dbObj.OrderItemID = this.orderItemID;
        }

        if (this.orderID !== null && this.orderID !== undefined) {
            dbObj.OrderID = this.orderID;
        }

        if (this.menuItemID !== null && this.menuItemID !== undefined) {
            dbObj.MenuItemID = this.menuItemID;
        }

        // Always include Quantity (defaults to 1)
        dbObj.Quantity = this.quantity !== undefined ? this.quantity : 1;

        if (this.price !== null && this.price !== undefined) {
            dbObj.Price = this.price;
        }

        // Always include Status (defaults to 'pending')
        dbObj.Status = this.status || 'pending';

        return dbObj;
    }

    /**
     * Creates an OrderItem instance from a database row
     * @param {Object} row - Database row object
     * @returns {OrderItem}
     */
    static fromDB(row) {
        return new OrderItem({
            orderItemID: row.OrderItemID,
            orderID: row.OrderID,
            menuItemID: row.MenuItemID,
            quantity: row.Quantity,
            price: row.Price,
            status: row.Status
        });
    }

    /**
     * Formats the order item for API response
     * @returns {Object}
     */
    toAPIResponse() {
        return {
            orderItemId: this.orderItemID,
            orderId: this.orderID,
            menuItemId: this.menuItemID,
            quantity: this.quantity,
            price: this.price ? parseFloat(this.price).toFixed(2) : null,
            status: this.status,
            subtotal: this.getSubtotal()
        };
    }

    /**
     * Creates a summary object for the order item
     * @returns {Object}
     */
    toSummary() {
        return {
            orderItemId: this.orderItemID,
            menuItemId: this.menuItemID,
            quantity: this.quantity,
            price: this.price ? parseFloat(this.price).toFixed(2) : null,
            subtotal: this.getSubtotal(),
            status: this.status
        };
    }

    /**
     * Calculates the subtotal for this order item (price * quantity)
     * @returns {string|null} Formatted subtotal or null if price is not set
     */
    getSubtotal() {
        if (this.price === null || this.price === undefined || this.quantity === null || this.quantity === undefined) {
            return null;
        }

        const priceNum = parseFloat(this.price);
        const quantityNum = parseInt(this.quantity);

        if (isNaN(priceNum) || isNaN(quantityNum)) {
            return null;
        }

        return (priceNum * quantityNum).toFixed(2);
    }

    /**
     * Updates the status of the order item
     * @param {string} newStatus - New status value
     * @returns {Object} { success: boolean, message: string, previousStatus: string }
     */
    updateStatus(newStatus) {
        const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'refunded'];
        
        if (!validStatuses.includes(newStatus)) {
            return {
                success: false,
                message: `Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`,
                previousStatus: this.status
            };
        }

        const previousStatus = this.status;
        this.status = newStatus;

        return {
            success: true,
            message: `Status updated from ${previousStatus} to ${newStatus}`,
            previousStatus: previousStatus
        };
    }

    /**
     * Updates the quantity
     * @param {number} newQuantity - New quantity value
     * @returns {Object} { success: boolean, message: string, previousQuantity: number }
     */
    updateQuantity(newQuantity) {
        const quantityNum = parseInt(newQuantity);

        if (isNaN(quantityNum) || quantityNum <= 0) {
            return {
                success: false,
                message: 'Quantity must be a positive integer',
                previousQuantity: this.quantity
            };
        }

        const previousQuantity = this.quantity;
        this.quantity = quantityNum;

        return {
            success: true,
            message: `Quantity updated from ${previousQuantity} to ${quantityNum}`,
            previousQuantity: previousQuantity
        };
    }

    /**
     * Checks if the order item can be cancelled
     * @returns {Object} { canCancel: boolean, reason: string }
     */
    canBeCancelled() {
        if (this.status === 'cancelled') {
            return {
                canCancel: false,
                reason: 'Order item is already cancelled'
            };
        }

        if (this.status === 'completed') {
            return {
                canCancel: false,
                reason: 'Cannot cancel completed order item'
            };
        }

        if (this.status === 'refunded') {
            return {
                canCancel: false,
                reason: 'Cannot cancel refunded order item'
            };
        }

        return {
            canCancel: true,
            reason: null
        };
    }

    /**
     * Cancels the order item
     * @returns {Object} { success: boolean, message: string }
     */
    cancel() {
        const { canCancel, reason } = this.canBeCancelled();

        if (!canCancel) {
            return {
                success: false,
                message: reason
            };
        }

        const previousStatus = this.status;
        this.status = 'cancelled';

        return {
            success: true,
            message: `Order item cancelled (was ${previousStatus})`
        };
    }

    /**
     * Checks if the order item can be refunded
     * @returns {Object} { canRefund: boolean, reason: string }
     */
    canBeRefunded() {
        if (this.status === 'refunded') {
            return {
                canRefund: false,
                reason: 'Order item is already refunded'
            };
        }

        if (this.status === 'cancelled') {
            return {
                canRefund: false,
                reason: 'Cannot refund cancelled order item'
            };
        }

        if (this.status === 'pending') {
            return {
                canRefund: false,
                reason: 'Cannot refund pending order item (cancel it instead)'
            };
        }

        return {
            canRefund: true,
            reason: null
        };
    }

    /**
     * Refunds the order item
     * @returns {Object} { success: boolean, message: string, refundAmount: string }
     */
    refund() {
        const { canRefund, reason } = this.canBeRefunded();

        if (!canRefund) {
            return {
                success: false,
                message: reason,
                refundAmount: null
            };
        }

        const previousStatus = this.status;
        this.status = 'refunded';

        return {
            success: true,
            message: `Order item refunded (was ${previousStatus})`,
            refundAmount: this.getSubtotal()
        };
    }

    /**
     * Checks if the order item is in a final state
     * @returns {boolean}
     */
    isFinalStatus() {
        const finalStatuses = ['completed', 'cancelled', 'refunded'];
        return finalStatuses.includes(this.status);
    }

    /**
     * Checks if the order item is active (can be modified)
     * @returns {boolean}
     */
    isActive() {
        return !this.isFinalStatus();
    }

    /**
     * Gets a human-readable status description
     * @returns {string}
     */
    getStatusDescription() {
        const statusDescriptions = {
            'pending': 'Waiting to be prepared',
            'in_progress': 'Being prepared',
            'completed': 'Ready for pickup/served',
            'cancelled': 'Cancelled by customer or staff',
            'refunded': 'Refunded to customer'
        };

        return statusDescriptions[this.status] || 'Unknown status';
    }

    /**
     * Validates quantity against available stock
     * @param {number} availableStock - Available stock quantity
     * @returns {Object} { isAvailable: boolean, message: string }
     */
    checkAvailability(availableStock) {
        const quantityNum = parseInt(this.quantity);
        const stockNum = parseInt(availableStock);

        if (isNaN(stockNum)) {
            return {
                isAvailable: false,
                message: 'Invalid stock quantity'
            };
        }

        if (quantityNum > stockNum) {
            return {
                isAvailable: false,
                message: `Insufficient stock. Requested: ${quantityNum}, Available: ${stockNum}`
            };
        }

        return {
            isAvailable: true,
            message: 'Item is available'
        };
    }
}

export default OrderItem;
