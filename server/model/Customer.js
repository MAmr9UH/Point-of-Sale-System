import { sha256hash } from '../utils/sha256.js';

class Customer {
    constructor(data = {}) {
        this.customerID = data.customerID || null;
        this.email = data.email || '';
        this.passwordHash = data.passwordHash || '';
        this.phoneNumber = data.phoneNumber || null;
        this.fname = data.fname || null;
        this.lname = data.lname || null;
        this.incentivePoints = data.incentivePoints !== undefined ? data.incentivePoints : 0;
        this.optInMarketing = data.optInMarketing !== undefined ? data.optInMarketing : false;
        this.payRate = data.payRate || null;
        this.createdAt = data.createdAt || null;
        this.lastUpdatedAt = data.lastUpdatedAt || null;
    }

    /**
     * Validates the Customer instance
     * @returns {Object} { isValid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        // Email validation - required, max 255 characters, valid format, unique
        if (!this.email || this.email.trim() === '') {
            errors.push('Email is required');
        } else if (this.email.length > 255) {
            errors.push('Email must not exceed 255 characters');
        } else {
            // Basic email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.email)) {
                errors.push('Email must be a valid email address');
            }
        }

        // PasswordHash validation - required, max 255 characters
        if (!this.passwordHash || this.passwordHash.trim() === '') {
            errors.push('Password hash is required');
        } else if (this.passwordHash.length > 255) {
            errors.push('Password hash must not exceed 255 characters');
        }

        // PhoneNumber validation - optional, exactly 10 digits
        if (this.phoneNumber !== null && this.phoneNumber !== undefined && this.phoneNumber !== '') {
            if (this.phoneNumber.trim().length !== 10) {
                errors.push('Phone number must be exactly 10 digits');
            }
        }

        // Fname validation - optional, max 20 characters
        if (this.fname && this.fname.length > 20) {
            errors.push('First name must not exceed 20 characters');
        }

        // Lname validation - optional, max 20 characters
        if (this.lname && this.lname.length > 20) {
            errors.push('Last name must not exceed 20 characters');
        }

        // IncentivePoints validation - must be a non-negative integer
        if (this.incentivePoints !== null && this.incentivePoints !== undefined) {
            const pointsNum = parseInt(this.incentivePoints);
            if (isNaN(pointsNum) || pointsNum < 0) {
                errors.push('Incentive points must be a non-negative integer');
            }
        }

        // OptInMarketing validation - must be a boolean
        if (typeof this.optInMarketing !== 'boolean') {
            errors.push('Opt-in marketing must be a boolean value');
        }

        // PayRate validation - optional, must be a positive number with max 2 decimal places
        if (this.payRate !== null && this.payRate !== undefined && this.payRate !== '') {
            const payRateNum = parseFloat(this.payRate);
            if (isNaN(payRateNum) || payRateNum < 0) {
                errors.push('Pay rate must be a positive number');
            } else if (payRateNum > 99999999.99) {
                errors.push('Pay rate exceeds maximum allowed value (99999999.99)');
            } else {
                // Check for max 2 decimal places
                const decimalPlaces = (this.payRate.toString().split('.')[1] || '').length;
                if (decimalPlaces > 2) {
                    errors.push('Pay rate must have at most 2 decimal places');
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
     * Converts the Customer instance to a plain object for JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            CustomerID: this.customerID,
            Email: this.email,
            PasswordHash: this.passwordHash,
            PhoneNumber: this.phoneNumber,
            Fname: this.fname,
            Lname: this.lname,
            IncentivePoints: this.incentivePoints,
            OptInMarketing: this.optInMarketing,
            PayRate: this.payRate,
            CreatedAt: this.createdAt,
            LastUpdatedAt: this.lastUpdatedAt
        };
    }

    /**
     * Converts the Customer instance to a database-compatible object
     * Excludes null values and auto-generated fields as needed
     * @param {boolean} includeID - Whether to include CustomerID (false for INSERT, true for UPDATE)
     * @returns {Object}
     */
    toDB(includeID = false) {
        const dbObj = {};

        if (includeID && this.customerID !== null) {
            dbObj.CustomerID = this.customerID;
        }

        if (this.email !== null && this.email !== undefined && this.email !== '') {
            dbObj.Email = this.email;
        }

        if (this.passwordHash !== null && this.passwordHash !== undefined && this.passwordHash !== '') {
            dbObj.PasswordHash = this.passwordHash;
        }

        if (this.phoneNumber !== null && this.phoneNumber !== undefined) {
            dbObj.PhoneNumber = this.phoneNumber;
        }

        if (this.fname !== null && this.fname !== undefined) {
            dbObj.Fname = this.fname;
        }

        if (this.lname !== null && this.lname !== undefined) {
            dbObj.Lname = this.lname;
        }

        // Always include IncentivePoints (defaults to 0)
        dbObj.IncentivePoints = this.incentivePoints !== undefined ? this.incentivePoints : 0;

        // Always include OptInMarketing (defaults to false)
        dbObj.OptInMarketing = this.optInMarketing;

        if (this.payRate !== null && this.payRate !== undefined) {
            dbObj.PayRate = this.payRate;
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
     * Creates a Customer instance from a database row
     * @param {Object} row - Database row object
     * @returns {Customer}
     */
    static fromDB(row) {
        return new Customer({
            customerID: row.CustomerID,
            email: row.Email,
            passwordHash: row.PasswordHash,
            phoneNumber: row.PhoneNumber,
            fname: row.Fname,
            lname: row.Lname,
            incentivePoints: row.IncentivePoints,
            optInMarketing: Boolean(row.OptInMarketing),
            payRate: row.PayRate,
            createdAt: row.CreatedAt,
            lastUpdatedAt: row.LastUpdatedAt
        });
    }

    /**
     * Formats the customer for API response (excludes sensitive data)
     * @returns {Object}
     */
    toAPIResponse() {
        return {
            customerId: this.customerID,
            email: this.email,
            phoneNumber: this.phoneNumber,
            firstName: this.fname,
            lastName: this.lname,
            fullName: this.getFullName(),
            incentivePoints: this.incentivePoints,
            optInMarketing: this.optInMarketing,
            payRate: this.payRate ? parseFloat(this.payRate).toFixed(2) : null,
            createdAt: this.createdAt,
            lastUpdatedAt: this.lastUpdatedAt
        };
    }

    /**
     * Formats the customer for public profile (excludes sensitive data and internal fields)
     * @returns {Object}
     */
    toPublicProfile() {
        return {
            customerId: this.customerID,
            email: this.email,
            firstName: this.fname,
            lastName: this.lname,
            fullName: this.getFullName(),
            incentivePoints: this.incentivePoints
        };
    }

    /**
     * Creates a summary object for the customer (useful for lists)
     * @returns {Object}
     */
    toSummary() {
        return {
            customerId: this.customerID,
            email: this.email,
            fullName: this.getFullName(),
            incentivePoints: this.incentivePoints
        };
    }

    /**
     * Gets the customer's full name
     * @returns {string}
     */
    getFullName() {
        if (this.fname && this.lname) {
            return `${this.fname} ${this.lname}`;
        } else if (this.fname) {
            return this.fname;
        } else if (this.lname) {
            return this.lname;
        }
        return 'Customer';
    }

    /**
     * Adds incentive points to the customer's account
     * @param {number} points - Points to add (can be negative to subtract)
     * @returns {number} New total points
     */
    addIncentivePoints(points) {
        const pointsNum = parseInt(points);
        if (isNaN(pointsNum)) {
            throw new Error('Points must be a valid number');
        }
        
        this.incentivePoints = Math.max(0, (this.incentivePoints || 0) + pointsNum);
        return this.incentivePoints;
    }

    /**
     * Checks if customer has enough points for a redemption
     * @param {number} pointsRequired - Points needed
     * @returns {boolean}
     */
    hasEnoughPoints(pointsRequired) {
        return (this.incentivePoints || 0) >= pointsRequired;
    }

    /**
     * Redeems incentive points
     * @param {number} points - Points to redeem
     * @returns {Object} { success: boolean, newBalance: number, message: string }
     */
    redeemPoints(points) {
        const pointsNum = parseInt(points);
        if (isNaN(pointsNum) || pointsNum <= 0) {
            return {
                success: false,
                newBalance: this.incentivePoints,
                message: 'Points to redeem must be a positive number'
            };
        }

        if (!this.hasEnoughPoints(pointsNum)) {
            return {
                success: false,
                newBalance: this.incentivePoints,
                message: `Insufficient points. Have: ${this.incentivePoints}, Need: ${pointsNum}`
            };
        }

        this.incentivePoints -= pointsNum;
        return {
            success: true,
            newBalance: this.incentivePoints,
            message: `Successfully redeemed ${pointsNum} points`
        };
    }

    /**
     * Toggles marketing opt-in status
     * @returns {boolean} New opt-in status
     */
    toggleMarketingOptIn() {
        this.optInMarketing = !this.optInMarketing;
        return this.optInMarketing;
    }

    /**
     * Checks if the customer profile is complete
     * @returns {Object} { isComplete: boolean, missingFields: string[] }
     */
    isProfileComplete() {
        const missingFields = [];

        if (!this.email) missingFields.push('email');
        if (!this.fname) missingFields.push('firstName');
        if (!this.lname) missingFields.push('lastName');
        if (!this.phoneNumber) missingFields.push('phoneNumber');

        return {
            isComplete: missingFields.length === 0,
            missingFields
        };
    }

    async validatePassword(password) {
        let hashedPassword = await sha256hash(password);
        return hashedPassword === this.passwordHash;
    }
}

export default Customer;

import { db } from '../db/connection.js';

export const findCustomerByPhoneNumber = async (phoneNumber) => {
    const query = 'SELECT * FROM Customer WHERE PhoneNumber = ?';
    const [rows] = await db.execute(query, [phoneNumber]);
    return rows.length > 0 ? Customer.fromDB(rows[0]) : null;
}

export const findCustomerById = async (customerID) => {
    const query = 'SELECT * FROM Customer WHERE CustomerID = ?';
    const [rows] = await db.execute(query, [customerID]);
    return rows.length > 0 ? Customer.fromDB(rows[0]) : null;
}

export const findCustomerByEmail = async (email) => {
    const query = 'SELECT * FROM Customer WHERE Email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows.length > 0 ? Customer.fromDB(rows[0]) : null;
}

export const createNewCustomer = async (customerData) => {
    customerData.passwordHash = await sha256hash(customerData.password);

    const customer = new Customer(customerData);
    const validation = customer.validate();
    if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const dbObj = customer.toDB(false);

    console.log(dbObj);

    const query = 'INSERT INTO Customer (Email, PasswordHash, PhoneNumber, Fname, Lname, CreatedAt, LastUpdatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())';
    const [result] = await db.execute(query, [
        dbObj.Email,
        dbObj.PasswordHash,
        dbObj.PhoneNumber || null,
        dbObj.Fname || null,
        dbObj.Lname || null,
    ]);

    customer.customerID = result.insertId;
    return customer;
}