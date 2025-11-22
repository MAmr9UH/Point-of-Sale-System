class Location {
    constructor(data = {}) {
        this.name = data.name || null;
        this.address = data.address || null;
        this.dailyFee = data.dailyFee || null;
        this.hostPhoneNumber = data.hostPhoneNumber || null;
        this.hostEmail = data.hostEmail || null;
        this.createdAt = data.createdAt || null;
        this.lastUpdatedAt = data.lastUpdatedAt || null;
    }

    /**
     * Validates the Location instance
     * @returns {Object} { isValid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        // Name validation - required, max 30 characters, unique (primary key)
        if (!this.name || this.name.trim() === '') {
            errors.push('Location name is required');
        } else if (this.name.length > 30) {
            errors.push('Location name must not exceed 30 characters');
        }

        // Address validation - optional, max 255 characters
        if (this.address && this.address.length > 255) {
            errors.push('Address must not exceed 255 characters');
        }

        // DailyFee validation - optional, must be a non-negative number with max 2 decimal places
        if (this.dailyFee !== null && this.dailyFee !== undefined && this.dailyFee !== '') {
            const dailyFeeNum = parseFloat(this.dailyFee);
            if (isNaN(dailyFeeNum) || dailyFeeNum < 0) {
                errors.push('Daily fee must be a non-negative number');
            } else if (dailyFeeNum > 99999999.99) {
                errors.push('Daily fee exceeds maximum allowed value (99999999.99)');
            } else {
                // Check for max 2 decimal places
                const decimalPlaces = (this.dailyFee.toString().split('.')[1] || '').length;
                if (decimalPlaces > 2) {
                    errors.push('Daily fee must have at most 2 decimal places');
                }
            }
        }

        // HostPhoneNumber validation - optional, exactly 10 digits
        if (this.hostPhoneNumber !== null && this.hostPhoneNumber !== undefined && this.hostPhoneNumber !== '') {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(this.hostPhoneNumber)) {
                errors.push('Host phone number must be exactly 10 digits');
            }
        }

        // HostEmail validation - optional, max 255 characters, valid format
        if (this.hostEmail !== null && this.hostEmail !== undefined && this.hostEmail !== '') {
            if (this.hostEmail.length > 255) {
                errors.push('Host email must not exceed 255 characters');
            } else {
                // Basic email format validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(this.hostEmail)) {
                    errors.push('Host email must be a valid email address');
                }
            }
        }

        // CreatedAt validation - optional, must be a valid date if provided
        if (this.createdAt !== null && this.createdAt !== undefined && this.createdAt !== '') {
            const date = new Date(this.createdAt);
            if (isNaN(date.getTime())) {
                errors.push('Created at must be a valid date');
            }
        }

        // LastUpdatedAt validation - optional, must be a valid date if provided
        if (this.lastUpdatedAt !== null && this.lastUpdatedAt !== undefined && this.lastUpdatedAt !== '') {
            const date = new Date(this.lastUpdatedAt);
            if (isNaN(date.getTime())) {
                errors.push('Last updated at must be a valid date');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Converts the Location instance to a plain object for JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            Name: this.name,
            Address: this.address,
            DailyFee: this.dailyFee,
            HostPhoneNumber: this.hostPhoneNumber,
            HostEmail: this.hostEmail,
            CreatedAt: this.createdAt,
            LastUpdatedAt: this.lastUpdatedAt
        };
    }

    /**
     * Converts the Location instance to a database-compatible object
     * Excludes null values and auto-generated fields as needed
     * @param {boolean} includeName - Whether to include Name (should be true for UPDATE if changing key)
     * @returns {Object}
     */
    toDB(includeName = true) {
        const dbObj = {};

        if (includeName && this.name !== null && this.name !== undefined && this.name !== '') {
            dbObj.Name = this.name;
        }

        if (this.address !== null && this.address !== undefined) {
            dbObj.Address = this.address;
        }

        if (this.dailyFee !== null && this.dailyFee !== undefined) {
            dbObj.DailyFee = this.dailyFee;
        }

        if (this.hostPhoneNumber !== null && this.hostPhoneNumber !== undefined) {
            dbObj.HostPhoneNumber = this.hostPhoneNumber;
        }

        if (this.hostEmail !== null && this.hostEmail !== undefined) {
            dbObj.HostEmail = this.hostEmail;
        }

        if (this.createdAt !== null && this.createdAt !== undefined) {
            dbObj.CreatedAt = this.createdAt;
        }

        if (this.lastUpdatedAt !== null && this.lastUpdatedAt !== undefined) {
            dbObj.LastUpdatedAt = this.lastUpdatedAt;
        }

        return dbObj;
    }

    /**
     * Creates a Location instance from a database row
     * @param {Object} row - Database row object
     * @returns {Location}
     */
    static fromDB(row) {
        return new Location({
            name: row.Name,
            address: row.Address,
            dailyFee: row.DailyFee,
            hostPhoneNumber: row.HostPhoneNumber,
            hostEmail: row.HostEmail,
            createdAt: row.CreatedAt,
            lastUpdatedAt: row.LastUpdatedAt
        });
    }

    /**
     * Formats the location for API response
     * @returns {Object}
     */
    toAPIResponse() {
        return {
            name: this.name,
            address: this.address,
            dailyFee: this.dailyFee ? parseFloat(this.dailyFee).toFixed(2) : null,
            hostPhoneNumber: this.hostPhoneNumber,
            hostEmail: this.hostEmail,
            createdAt: this.createdAt,
            lastUpdatedAt: this.lastUpdatedAt
        };
    }

    /**
     * Creates a summary object for the location (useful for lists/dropdowns)
     * @returns {Object}
     */
    toSummary() {
        return {
            name: this.name,
            address: this.address,
            dailyFee: this.dailyFee ? parseFloat(this.dailyFee).toFixed(2) : null
        };
    }

    /**
     * Formats the location for display with full details
     * @returns {Object}
     */
    toDetailedView() {
        return {
            name: this.name,
            address: this.address || 'Not specified',
            dailyFee: this.dailyFee ? `$${parseFloat(this.dailyFee).toFixed(2)}` : 'Not specified',
            contact: this.getContactInfo(),
            createdAt: this.createdAt,
            lastUpdatedAt: this.lastUpdatedAt
        };
    }

    /**
     * Gets formatted contact information
     * @returns {Object}
     */
    getContactInfo() {
        const contact = {};
        
        if (this.hostPhoneNumber) {
            contact.phone = this.formatPhoneNumber();
        }
        
        if (this.hostEmail) {
            contact.email = this.hostEmail;
        }

        return Object.keys(contact).length > 0 ? contact : null;
    }

    /**
     * Formats phone number for display (XXX) XXX-XXXX
     * @returns {string|null}
     */
    formatPhoneNumber() {
        if (!this.hostPhoneNumber || this.hostPhoneNumber.length !== 10) {
            return this.hostPhoneNumber;
        }

        const areaCode = this.hostPhoneNumber.substring(0, 3);
        const prefix = this.hostPhoneNumber.substring(3, 6);
        const lineNumber = this.hostPhoneNumber.substring(6, 10);

        return `(${areaCode}) ${prefix}-${lineNumber}`;
    }

    /**
     * Calculates the monthly fee based on daily fee
     * @param {number} daysInMonth - Number of days (default 30)
     * @returns {number|null}
     */
    getMonthlyFee(daysInMonth = 30) {
        if (this.dailyFee === null || this.dailyFee === undefined) {
            return null;
        }

        const dailyFeeNum = parseFloat(this.dailyFee);
        if (isNaN(dailyFeeNum)) {
            return null;
        }

        return dailyFeeNum * daysInMonth;
    }

    /**
     * Calculates the yearly fee based on daily fee
     * @param {number} daysInYear - Number of days (default 365)
     * @returns {number|null}
     */
    getYearlyFee(daysInYear = 365) {
        if (this.dailyFee === null || this.dailyFee === undefined) {
            return null;
        }

        const dailyFeeNum = parseFloat(this.dailyFee);
        if (isNaN(dailyFeeNum)) {
            return null;
        }

        return dailyFeeNum * daysInYear;
    }

    /**
     * Checks if the location has complete contact information
     * @returns {Object} { hasContact: boolean, missingFields: string[] }
     */
    hasCompleteContactInfo() {
        const missingFields = [];

        if (!this.hostPhoneNumber) missingFields.push('hostPhoneNumber');
        if (!this.hostEmail) missingFields.push('hostEmail');

        return {
            hasContact: missingFields.length === 0,
            missingFields
        };
    }

    /**
     * Generates a display name for the location
     * @returns {string}
     */
    getDisplayName() {
        if (this.name && this.address) {
            return `${this.name} - ${this.address}`;
        }
        return this.name || 'Unnamed Location';
    }

    /**
     * Checks if location has a host assigned
     * @returns {boolean}
     */
    hasHost() {
        return !!(this.hostPhoneNumber || this.hostEmail);
    }

    /**
     * Validates and formats fee updates
     * @param {number} newFee - New daily fee
     * @returns {Object} { isValid: boolean, formattedFee: number, error: string }
     */
    validateFeeUpdate(newFee) {
        const feeNum = parseFloat(newFee);
        
        if (isNaN(feeNum)) {
            return {
                isValid: false,
                formattedFee: null,
                error: 'Fee must be a valid number'
            };
        }

        if (feeNum < 0) {
            return {
                isValid: false,
                formattedFee: null,
                error: 'Fee cannot be negative'
            };
        }

        if (feeNum > 99999999.99) {
            return {
                isValid: false,
                formattedFee: null,
                error: 'Fee exceeds maximum allowed value'
            };
        }

        // Round to 2 decimal places
        const formattedFee = Math.round(feeNum * 100) / 100;

        return {
            isValid: true,
            formattedFee: formattedFee,
            error: null
        };
    }
}

export default Location;

import { db } from '../db/connection.js';

export const findLocationByName = async (name) => {
    const query = 'SELECT * FROM pos.Location WHERE Name = ? AND is_active = TRUE LIMIT 1';
    const [rows] = await db.execute(query, [name]);
    return rows.length > 0 ? Location.fromDB(rows[0]) : null;
}

export const getCurrentLocation = async () => {
    const query = 'SELECT * FROM pos.Location WHERE is_active = TRUE';
    const [rows] = await db.execute(query);
    return rows.map(row => Location.fromDB(row));
}
