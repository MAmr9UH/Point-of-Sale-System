class ActiveLocation {
    constructor(data = {}) {
        this.activeLocationID = data.activeLocationID || null;
        this.locationName = data.locationName || null;
        this.beginOperationOn = data.beginOperationOn || null;
        this.endOperationOn = data.endOperationOn || null;
        this.daysOfWeek = data.daysOfWeek || [];

        this.address = data.address || null; // If joined with Location table
    }

    /**
     * Validates the ActiveLocation instance
     * @returns {Object} { isValid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        // LocationName validation - required, max 30 characters (foreign key)
        if (!this.locationName || this.locationName.trim() === '') {
            errors.push('Location name is required');
        } else if (this.locationName.length > 30) {
            errors.push('Location name must not exceed 30 characters');
        }

        // BeginOperationOn validation - optional, must be a valid date if provided
        if (this.beginOperationOn !== null && this.beginOperationOn !== undefined && this.beginOperationOn !== '') {
            const date = new Date(this.beginOperationOn);
            if (isNaN(date.getTime())) {
                errors.push('Begin operation date must be a valid date');
            }
        }

        // EndOperationOn validation - optional, must be a valid date if provided
        if (this.endOperationOn !== null && this.endOperationOn !== undefined && this.endOperationOn !== '') {
            const date = new Date(this.endOperationOn);
            if (isNaN(date.getTime())) {
                errors.push('End operation date must be a valid date');
            }

            // If both dates are provided, end must be after begin
            if (this.beginOperationOn) {
                const beginDate = new Date(this.beginOperationOn);
                const endDate = new Date(this.endOperationOn);
                if (endDate <= beginDate) {
                    errors.push('End operation date must be after begin operation date');
                }
            }
        }

        // DaysOfWeek validation - must be an array of valid day values
        const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        if (this.daysOfWeek && Array.isArray(this.daysOfWeek)) {
            const invalidDays = this.daysOfWeek.filter(day => !validDays.includes(day));
            if (invalidDays.length > 0) {
                errors.push(`Invalid days of week: ${invalidDays.join(', ')}. Must be one of: ${validDays.join(', ')}`);
            }
        } else if (this.daysOfWeek && !Array.isArray(this.daysOfWeek)) {
            errors.push('Days of week must be an array');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Converts the ActiveLocation instance to a plain object for JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            ActiveLocationID: this.activeLocationID,
            LocationName: this.locationName,
            BeginOperationOn: this.beginOperationOn,
            EndOperationOn: this.endOperationOn,
            DaysOfWeek: this.daysOfWeek,
            Address: this.address
        };
    }

    /**
     * Converts the ActiveLocation instance to a database-compatible object
     * Excludes null values and auto-generated fields as needed
     * @param {boolean} includeID - Whether to include ActiveLocationID (false for INSERT, true for UPDATE)
     * @returns {Object}
     */
    toDB(includeID = false) {
        const dbObj = {};

        if (includeID && this.activeLocationID !== null) {
            dbObj.ActiveLocationID = this.activeLocationID;
        }

        if (this.locationName !== null && this.locationName !== undefined && this.locationName !== '') {
            dbObj.LocationName = this.locationName;
        }

        if (this.beginOperationOn !== null && this.beginOperationOn !== undefined) {
            dbObj.BeginOperationOn = this.beginOperationOn;
        }

        if (this.endOperationOn !== null && this.endOperationOn !== undefined) {
            dbObj.EndOperationOn = this.endOperationOn;
        }

        // Convert array to SET format for MySQL (comma-separated string)
        if (this.daysOfWeek && Array.isArray(this.daysOfWeek) && this.daysOfWeek.length > 0) {
            dbObj.DaysOfWeek = this.daysOfWeek.join(',');
        }

        return dbObj;
    }

    /**
     * Creates an ActiveLocation instance from a database row
     * @param {Object} row - Database row object
     * @returns {ActiveLocation}
     */
    static fromDB(row) {
        // Parse SET data type - can come as string or array
        let daysOfWeek = [];
        if (row.DaysOfWeek) {
            if (typeof row.DaysOfWeek === 'string') {
                daysOfWeek = row.DaysOfWeek.split(',').map(day => day.trim());
            } else if (Array.isArray(row.DaysOfWeek)) {
                daysOfWeek = row.DaysOfWeek;
            }
        }

        return new ActiveLocation({
            activeLocationID: row.ActiveLocationID,
            locationName: row.LocationName,
            beginOperationOn: row.BeginOperationOn,
            endOperationOn: row.EndOperationOn,
            daysOfWeek: daysOfWeek,
            address: row.Address || null
        });
    }

    /**
     * Formats the active location for API response
     * @returns {Object}
     */
    toAPIResponse() {
        return {
            activeLocationId: this.activeLocationID,
            locationName: this.locationName,
            beginOperationOn: this.beginOperationOn,
            endOperationOn: this.endOperationOn,
            daysOfWeek: this.daysOfWeek,
            isActive: this.isCurrentlyActive(),
            duration: this.getOperationDuration()
        };
    }

    /**
     * Creates a summary object for the active location
     * @returns {Object}
     */
    toSummary() {
        return {
            activeLocationId: this.activeLocationID,
            locationName: this.locationName,
            beginOperationOn: this.beginOperationOn,
            endOperationOn: this.endOperationOn,
            isActive: this.isCurrentlyActive()
        };
    }

    /**
     * Checks if the location is currently active (no end date or end date is in the future)
     * @returns {boolean}
     */
    isCurrentlyActive() {
        if (!this.endOperationOn) {
            return true;
        }

        const endDate = new Date(this.endOperationOn);
        const now = new Date();
        return endDate > now;
    }

    /**
     * Checks if the location was active on a specific date
     * @param {Date|string} date - Date to check
     * @returns {boolean}
     */
    isActiveOnDate(date) {
        const checkDate = new Date(date);
        
        if (isNaN(checkDate.getTime())) {
            return false;
        }

        const beginDate = this.beginOperationOn ? new Date(this.beginOperationOn) : null;
        const endDate = this.endOperationOn ? new Date(this.endOperationOn) : null;

        // Check if date is within operation range
        if (beginDate && checkDate < beginDate) {
            return false;
        }

        if (endDate && checkDate > endDate) {
            return false;
        }

        return true;
    }

    /**
     * Checks if the location operates on a specific day of the week
     * @param {string} day - Day abbreviation ('Mon', 'Tue', etc.)
     * @returns {boolean}
     */
    operatesOnDay(day) {
        if (!this.daysOfWeek || !Array.isArray(this.daysOfWeek)) {
            return false;
        }
        return this.daysOfWeek.includes(day);
    }

    /**
     * Checks if the location operates on today
     * @returns {boolean}
     */
    operatesToday() {
        const today = new Date();
        const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const todayAbbr = dayMap[today.getDay()];


        return this.isCurrentlyActive() && this.operatesOnDay(todayAbbr);
    }

    /**
     * Gets the operation duration in days
     * @returns {number|null} Number of days, or null if location is still active
     */
    getOperationDuration() {
        if (!this.beginOperationOn) {
            return null;
        }

        const beginDate = new Date(this.beginOperationOn);
        const endDate = this.endOperationOn ? new Date(this.endOperationOn) : new Date();

        const diffTime = Math.abs(endDate - beginDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    /**
     * Gets formatted operation period
     * @returns {string}
     */
    getOperationPeriod() {
        const beginDate = this.beginOperationOn ? new Date(this.beginOperationOn).toLocaleDateString() : 'Unknown';
        const endDate = this.endOperationOn ? new Date(this.endOperationOn).toLocaleDateString() : 'Present';
        
        return `${beginDate} - ${endDate}`;
    }

    /**
     * Gets formatted days of week string
     * @returns {string}
     */
    getDaysOfWeekString() {
        if (!this.daysOfWeek || this.daysOfWeek.length === 0) {
            return 'No days specified';
        }

        // Sort days in week order
        const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const sortedDays = this.daysOfWeek.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

        // Check for consecutive days to create ranges
        if (sortedDays.length === 7) {
            return 'Every day';
        }

        if (sortedDays.length === 5 && !sortedDays.includes('Sat') && !sortedDays.includes('Sun')) {
            return 'Weekdays';
        }

        if (sortedDays.length === 2 && sortedDays.includes('Sat') && sortedDays.includes('Sun')) {
            return 'Weekends';
        }

        return sortedDays.join(', ');
    }

    /**
     * Deactivates the location by setting end operation date to now
     * @returns {Date} The end operation date
     */
    deactivate() {
        this.endOperationOn = new Date();
        return this.endOperationOn;
    }

    /**
     * Reactivates the location by clearing the end operation date
     */
    reactivate() {
        this.endOperationOn = null;
    }

    /**
     * Adds a day to the operation schedule
     * @param {string} day - Day abbreviation
     * @returns {Object} { success: boolean, message: string }
     */
    addOperationDay(day) {
        const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        if (!validDays.includes(day)) {
            return {
                success: false,
                message: `Invalid day: ${day}. Must be one of: ${validDays.join(', ')}`
            };
        }

        if (!this.daysOfWeek) {
            this.daysOfWeek = [];
        }

        if (this.daysOfWeek.includes(day)) {
            return {
                success: false,
                message: `${day} is already in the operation schedule`
            };
        }

        this.daysOfWeek.push(day);
        return {
            success: true,
            message: `${day} added to operation schedule`
        };
    }

    /**
     * Removes a day from the operation schedule
     * @param {string} day - Day abbreviation
     * @returns {Object} { success: boolean, message: string }
     */
    removeOperationDay(day) {
        if (!this.daysOfWeek || !Array.isArray(this.daysOfWeek)) {
            return {
                success: false,
                message: 'No operation days configured'
            };
        }

        const index = this.daysOfWeek.indexOf(day);
        if (index === -1) {
            return {
                success: false,
                message: `${day} is not in the operation schedule`
            };
        }

        this.daysOfWeek.splice(index, 1);
        return {
            success: true,
            message: `${day} removed from operation schedule`
        };
    }

    /**
     * Gets the day of week for a given date
     * @param {Date|string} date - Date to check
     * @returns {string|null} Day abbreviation or null if invalid date
     */
    static getDayOfWeek(date) {
        const checkDate = new Date(date);
        
        if (isNaN(checkDate.getTime())) {
            return null;
        }

        const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return dayMap[checkDate.getDay()];
    }

    /**
     * Checks if the location operates on a specific date (considering both date range and day of week)
     * @param {Date|string} date - Date to check
     * @returns {boolean}
     */
    isOperatingOnDate(date) {
        if (!this.isActiveOnDate(date)) {
            return false;
        }

        const dayOfWeek = ActiveLocation.getDayOfWeek(date);
        if (!dayOfWeek) {
            return false;
        }

        return this.operatesOnDay(dayOfWeek);
    }
}
export default ActiveLocation;

import { db } from '../db/connection.js';

export const getCurrentActiveLocations = async () => {

    const query = `
        SELECT l.Address, al.*
        FROM Location l
        JOIN Active_Location al ON l.Name = al.LocationName
        WHERE al.EndOperationOn IS NULL
    `;
    const [results] = await db.query(query);

    return results.map(row => ActiveLocation.fromDB(row));
};

export const getLocationToday = async () => {
    const activelocations = await getCurrentActiveLocations();

    return activelocations.filter(loc => loc.operatesToday());
}