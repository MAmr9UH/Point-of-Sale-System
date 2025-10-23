class MenuItem {
    constructor(data = {}) {
        this.menuItemID = data.menuItemID || null;
        this.name = data.name || '';
        this.description = data.description || null;
        this.price = data.price || 0;
        this.category = data.category || null;
        this.availability = data.availability !== undefined ? data.availability : true;
        this.createdAt = data.createdAt || null;
        this.lastUpdatedAt = data.lastUpdatedAt || null;
    }

    /**
     * Validates the MenuItem instance
     * @returns {Object} { isValid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        // Name validation - required, max 30 characters
        if (!this.name || this.name.trim() === '') {
            errors.push('Name is required');
        } else if (this.name.length > 30) {
            errors.push('Name must not exceed 30 characters');
        }

        // Description validation - optional, max 500 characters
        if (this.description && this.description.length > 500) {
            errors.push('Description must not exceed 500 characters');
        }

        // Price validation - required, must be a positive number with max 2 decimal places
        if (this.price === null || this.price === undefined || this.price === '') {
            errors.push('Price is required');
        } else {
            const priceNum = parseFloat(this.price);
            if (isNaN(priceNum) || priceNum < 0) {
                errors.push('Price must be a positive number');
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

        // Category validation - must be one of the allowed values
        const validCategories = ['appetizer', 'entre', 'dessert', 'beverage'];
        if (this.category && !validCategories.includes(this.category)) {
            errors.push(`Category must be one of: ${validCategories.join(', ')}`);
        }

        // Availability validation - must be boolean
        if (typeof this.availability !== 'boolean') {
            errors.push('Availability must be a boolean value');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Converts the MenuItem instance to a plain object for database insertion
     * @returns {Object}
     */
    toJSON() {
        return {
            MenuItemID: this.menuItemID,
            Name: this.name,
            Description: this.description,
            Price: this.price,
            Category: this.category,
            Availability: this.availability,
            CreatedAt: this.createdAt,
            LastUpdatedAt: this.lastUpdatedAt
        };
    }

    /**
     * Creates a MenuItem instance from database row
     * @param {Object} row - Database row object
     * @returns {MenuItem}
     */
    static fromDB(row) {
        return new MenuItem({
            menuItemID: row.MenuItemID,
            name: row.Name,
            description: row.Description,
            price: row.Price,
            category: row.Category,
            availability: row.Availability,
            createdAt: row.CreatedAt,
            lastUpdatedAt: row.LastUpdatedAt
        });
    }

    /**
     * Validates and returns data ready for database insertion (excluding auto-generated fields)
     * @returns {Object|null} Returns formatted data if valid, null otherwise
     */
    getInsertData() {
        const validation = this.validate();
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        return {
            Name: this.name.trim(),
            Description: this.description ? this.description.trim() : null,
            Price: parseFloat(this.price),
            Category: this.category,
            Availability: this.availability
        };
    }

    /**
     * Validates and returns data ready for database update
     * @returns {Object|null} Returns formatted data if valid, null otherwise
     */
    getUpdateData() {
        const validation = this.validate();
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        const updateData = {
            Name: this.name.trim(),
            Description: this.description ? this.description.trim() : null,
            Price: parseFloat(this.price),
            Category: this.category,
            Availability: this.availability
        };

        // Only include menuItemID if it exists
        if (this.menuItemID) {
            updateData.MenuItemID = this.menuItemID;
        }

        return updateData;
    }
}

import { db } from '../db/connection.js';

export const getAllMenuItems = async () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM MenuItems';
        db.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.map(row => MenuItem.fromDB(row)));
            }
        });
    });
}

export default MenuItem;
