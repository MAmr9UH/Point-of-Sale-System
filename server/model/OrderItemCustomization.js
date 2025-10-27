class OrderItemCustomization {
    constructor(data = {}) {
        this.orderItemCustomizationID = data.orderItemCustomizationID || null;
        this.orderItemID = data.orderItemID || null;
        this.ingredientID = data.ingredientID || null;
        this.changeType = data.changeType || null;
        this.quantityDelta = data.quantityDelta !== undefined ? data.quantityDelta : 1;
        this.priceDelta = data.priceDelta !== undefined ? data.priceDelta : 0.00;
        this.note = data.note || null;
        this.createdAt = data.createdAt || null;
    }

    /**
     * Validates the OrderItemCustomization instance
     * @returns {Object} { isValid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        // OrderItemID validation - required, must be a positive integer
        if (this.orderItemID === null || this.orderItemID === undefined || this.orderItemID === '') {
            errors.push('Order Item ID is required');
        } else {
            const orderItemIDNum = parseInt(this.orderItemID);
            if (isNaN(orderItemIDNum) || orderItemIDNum <= 0) {
                errors.push('Order Item ID must be a positive integer');
            }
        }

        // IngredientID validation - required, must be a positive integer
        if (this.ingredientID === null || this.ingredientID === undefined || this.ingredientID === '') {
            errors.push('Ingredient ID is required');
        } else {
            const ingredientIDNum = parseInt(this.ingredientID);
            if (isNaN(ingredientIDNum) || ingredientIDNum <= 0) {
                errors.push('Ingredient ID must be a positive integer');
            }
        }

        // ChangeType validation - required, must be one of the allowed values
        const validChangeTypes = ['added', 'removed', 'substituted'];
        if (!this.changeType || this.changeType.trim() === '') {
            errors.push('Change type is required');
        } else if (!validChangeTypes.includes(this.changeType)) {
            errors.push(`Change type must be one of: ${validChangeTypes.join(', ')}`);
        }

        // QuantityDelta validation - required, must be an integer
        if (this.quantityDelta === null || this.quantityDelta === undefined || this.quantityDelta === '') {
            errors.push('Quantity delta is required');
        } else {
            const quantityDeltaNum = parseInt(this.quantityDelta);
            if (isNaN(quantityDeltaNum)) {
                errors.push('Quantity delta must be an integer');
            }
            // Note: QuantityDelta can be negative for removals, so we don't check for positivity
        }

        // PriceDelta validation - optional, must be a number with max 2 decimal places
        if (this.priceDelta !== null && this.priceDelta !== undefined && this.priceDelta !== '') {
            const priceDeltaNum = parseFloat(this.priceDelta);
            if (isNaN(priceDeltaNum)) {
                errors.push('Price delta must be a number');
            } else if (Math.abs(priceDeltaNum) > 99999999.99) {
                errors.push('Price delta exceeds maximum allowed value (±99999999.99)');
            } else {
                // Check for max 2 decimal places
                const decimalPlaces = (this.priceDelta.toString().split('.')[1] || '').length;
                if (decimalPlaces > 2) {
                    errors.push('Price delta must have at most 2 decimal places');
                }
            }
        }

        // Note validation - optional, max 255 characters
        if (this.note && this.note.length > 255) {
            errors.push('Note must not exceed 255 characters');
        }

        // CreatedAt validation - optional, must be a valid date if provided
        if (this.createdAt !== null && this.createdAt !== undefined && this.createdAt !== '') {
            const date = new Date(this.createdAt);
            if (isNaN(date.getTime())) {
                errors.push('Created at must be a valid date');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Converts the OrderItemCustomization instance to a plain object for JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            OrderItemCustomizationID: this.orderItemCustomizationID,
            OrderItemID: this.orderItemID,
            IngredientID: this.ingredientID,
            ChangeType: this.changeType,
            QuantityDelta: this.quantityDelta,
            PriceDelta: this.priceDelta,
            Note: this.note,
            CreatedAt: this.createdAt
        };
    }

    /**
     * Converts the OrderItemCustomization instance to a database-compatible object
     * Excludes null values and auto-generated fields as needed
     * @param {boolean} includeID - Whether to include OrderItemCustomizationID (false for INSERT, true for UPDATE)
     * @returns {Object}
     */
    toDB(includeID = false) {
        const dbObj = {};

        if (includeID && this.orderItemCustomizationID !== null) {
            dbObj.OrderItemCustomizationID = this.orderItemCustomizationID;
        }

        if (this.orderItemID !== null && this.orderItemID !== undefined) {
            dbObj.OrderItemID = this.orderItemID;
        }

        if (this.ingredientID !== null && this.ingredientID !== undefined) {
            dbObj.IngredientID = this.ingredientID;
        }

        if (this.changeType !== null && this.changeType !== undefined) {
            dbObj.ChangeType = this.changeType;
        }

        // Always include QuantityDelta (defaults to 1)
        dbObj.QuantityDelta = this.quantityDelta !== undefined ? this.quantityDelta : 1;

        // Always include PriceDelta (defaults to 0.00)
        dbObj.PriceDelta = this.priceDelta !== undefined ? this.priceDelta : 0.00;

        if (this.note !== null && this.note !== undefined) {
            dbObj.Note = this.note;
        }

        if (this.createdAt !== null && this.createdAt !== undefined) {
            dbObj.CreatedAt = this.createdAt;
        }

        return dbObj;
    }

    /**
     * Creates an OrderItemCustomization instance from a database row
     * @param {Object} row - Database row object
     * @returns {OrderItemCustomization}
     */
    static fromDB(row) {
        return new OrderItemCustomization({
            orderItemCustomizationID: row.OrderItemCustomizationID,
            orderItemID: row.OrderItemID,
            ingredientID: row.IngredientID,
            changeType: row.ChangeType,
            quantityDelta: row.QuantityDelta,
            priceDelta: row.PriceDelta,
            note: row.Note,
            createdAt: row.CreatedAt
        });
    }

    /**
     * Formats the customization for API response
     * @returns {Object}
     */
    toAPIResponse() {
        return {
            customizationId: this.orderItemCustomizationID,
            orderItemId: this.orderItemID,
            ingredientId: this.ingredientID,
            changeType: this.changeType,
            quantityDelta: this.quantityDelta,
            priceDelta: this.priceDelta ? parseFloat(this.priceDelta).toFixed(2) : '0.00',
            note: this.note,
            createdAt: this.createdAt
        };
    }

    /**
     * Creates a summary object for the customization (useful for order details)
     * @returns {Object}
     */
    toSummary() {
        return {
            ingredientId: this.ingredientID,
            changeType: this.changeType,
            quantityDelta: this.quantityDelta,
            priceDelta: this.priceDelta ? parseFloat(this.priceDelta).toFixed(2) : '0.00'
        };
    }

    /**
     * Gets a human-readable description of the customization
     * @param {string} ingredientName - Optional ingredient name to include in description
     * @returns {string}
     */
    getDescription(ingredientName = null) {
        const ingredient = ingredientName || `Ingredient #${this.ingredientID}`;
        
        switch (this.changeType) {
            case 'added':
                return `Add ${this.quantityDelta > 1 ? this.quantityDelta + 'x ' : ''}${ingredient}`;
            case 'removed':
                return `Remove ${ingredient}`;
            case 'substituted':
                return `Substitute with ${ingredient}`;
            default:
                return `Modify ${ingredient}`;
        }
    }

    /**
     * Validates if the customization makes logical sense
     * @returns {Object} { isLogical: boolean, warnings: string[] }
     */
    validateLogic() {
        const warnings = [];

        // Warn if quantity delta is 0 (no actual change)
        if (this.quantityDelta === 0) {
            warnings.push('Quantity delta is 0 - this customization has no effect');
        }

        // Warn if removing items but quantity delta is positive
        if (this.changeType === 'removed' && this.quantityDelta > 0) {
            warnings.push('Change type is "removed" but quantity delta is positive - consider making it negative');
        }

        // Warn if adding items but quantity delta is negative
        if (this.changeType === 'added' && this.quantityDelta < 0) {
            warnings.push('Change type is "added" but quantity delta is negative');
        }

        // Warn if price delta is negative for additions (unusual but not invalid)
        if (this.changeType === 'added' && this.priceDelta < 0) {
            warnings.push('Adding an ingredient with negative price delta (discount)');
        }

        // Warn if price delta is positive for removals (unusual but not invalid)
        if (this.changeType === 'removed' && this.priceDelta > 0) {
            warnings.push('Removing an ingredient with positive price delta (unusual)');
        }

        return {
            isLogical: warnings.length === 0,
            warnings
        };
    }
}

export default OrderItemCustomization;