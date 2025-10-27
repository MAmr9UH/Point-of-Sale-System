class Staff {
    constructor(data = {}) {
        this.staffID = data.staffID || null;
        this.role = data.role || null;
        this.email = data.email || '';
        this.passwordHash = data.passwordHash || '';
        this.phoneNumber = data.phoneNumber || null;
        this.fname = data.fname || null;
        this.lname = data.lname || null;
        this.payRate = data.payRate || null;
        this.createdAt = data.createdAt || null;
        this.lastUpdatedAt = data.lastUpdatedAt || null;
    }

    /**
     * Validates the Staff instance
     * @returns {Object} { isValid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        // Role validation - must be one of the allowed values
        const validRoles = ['admin', 'manager', 'employee'];
        if (this.role && !validRoles.includes(this.role)) {
            errors.push(`Role must be one of: ${validRoles.join(', ')}`);
        }

        // Email validation - required, max 255 characters, valid format
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
        if (this.phoneNumber) {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(this.phoneNumber)) {
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

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Converts the Staff instance to a plain object for database insertion
     * @returns {Object}
     */
    toJSON() {
        return {
            StaffID: this.staffID,
            Role: this.role,
            Email: this.email,
            PasswordHash: this.passwordHash,
            PhoneNumber: this.phoneNumber,
            Fname: this.fname,
            Lname: this.lname,
            PayRate: this.payRate,
            CreatedAt: this.createdAt,
            LastUpdatedAt: this.lastUpdatedAt
        };
    }

    /**
     * Creates a Staff instance from database row
     * @param {Object} row - Database row object
     * @returns {Staff}
     */
    static fromDB(row) {
        return new Staff({
            staffID: row.StaffID,
            role: row.Role,
            email: row.Email,
            passwordHash: row.PasswordHash,
            phoneNumber: row.PhoneNumber,
            fname: row.Fname,
            lname: row.Lname,
            payRate: row.PayRate,
            createdAt: row.CreatedAt,
            lastUpdatedAt: row.LastUpdatedAt
        });
    }

    /**
     * Validates and returns data ready for database insertion (excluding auto-generated fields)
     * @returns {Object} Returns formatted data if valid
     * @throws {Error} Throws error if validation fails
     */
    getInsertData() {
        const validation = this.validate();
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        return {
            Role: this.role,
            Email: this.email.trim(),
            PasswordHash: this.passwordHash,
            PhoneNumber: this.phoneNumber,
            Fname: this.fname ? this.fname.trim() : null,
            Lname: this.lname ? this.lname.trim() : null,
            PayRate: this.payRate !== null && this.payRate !== undefined ? parseFloat(this.payRate) : null
        };
    }

    /**
     * Validates and returns data ready for database update
     * @returns {Object} Returns formatted data if valid
     * @throws {Error} Throws error if validation fails
     */
    getUpdateData() {
        const validation = this.validate();
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        const updateData = {
            Role: this.role,
            Email: this.email.trim(),
            PasswordHash: this.passwordHash,
            PhoneNumber: this.phoneNumber,
            Fname: this.fname ? this.fname.trim() : null,
            Lname: this.lname ? this.lname.trim() : null,
            PayRate: this.payRate !== null && this.payRate !== undefined ? parseFloat(this.payRate) : null
        };

        // Only include staffID if it exists
        if (this.staffID) {
            updateData.StaffID = this.staffID;
        }

        return updateData;
    }

    /**
     * Gets the full name of the staff member
     * @returns {string}
     */
    getFullName() {
        const parts = [];
        if (this.fname) parts.push(this.fname);
        if (this.lname) parts.push(this.lname);
        return parts.join(' ') || 'N/A';
    }

    /**
     * Checks if the staff member has admin privileges
     * @returns {boolean}
     */
    isAdmin() {
        return this.role === 'admin';
    }

    /**
     * Checks if the staff member has manager privileges
     * @returns {boolean}
     */
    isManager() {
        return this.role === 'manager' || this.role === 'admin';
    }
}

export default Staff;

import { db } from '../db/connection.js';

export const getCurrentWorkingStaff = async (locationName) => {
    const query = `
        SELECT S.*
        FROM Staff AS S
        JOIN Assigns AS A ON S.StaffID = A.StaffID
        JOIN Active_Location AS AL ON A.ActiveLocationID = AL.ActiveLocationID
        WHERE AL.LocationName = ? AND A.ScheduleStart <= NOW() AND (A.ScheduleEnd IS NULL OR A.ScheduleEnd >= NOW())
        ORDER BY A.ScheduleStart DESC
        LIMIT 1;
    `;
    const results = await db.query(query, [locationName]);
    return results.length > 0 ? Staff.fromDB(results[0]) : null;
}
