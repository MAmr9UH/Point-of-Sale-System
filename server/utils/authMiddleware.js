import { authenticate, checkRole, checkOwnership } from '../utils/jwt.js';

/**
 * Wrapper to apply authentication middleware to route handlers
 * Works with Node HTTP (not Express)
 * @param {Function} handler - Route handler function
 * @param {Object} options - Authentication options
 * @param {string[]} options.roles - Allowed roles for the route
 * @param {boolean} options.requireAuth - Whether authentication is required (default: true)
 * @returns {Function} Wrapped handler with authentication
 */
export function withAuth(handler, options = {}) {
    const {
        roles = [],
        requireAuth = true
    } = options;

    return async (req, res) => {
        // If authentication is not required, just call the handler
        if (!requireAuth) {
            return handler(req, res);
        }

        // Authenticate - returns null if authentication fails (response already sent)
        const user = authenticate(req, res);
        if (!user) return;

        console.log(user)

        // If roles are specified, check authorization
        if (roles.length > 0) {
            const authorized = checkRole(req, res, ...roles);
            if (!authorized) return;
        }

        // Call the handler
        return handler(req, res);
    };
}

/**
 * Helper to extract staff ID from authenticated user
 * @param {Object} req - Request object
 * @returns {number|null} Staff ID or null
 */
export function getAuthStaffId(req) {
    return req.user && (req.user.role === 'employee' || req.user.role === 'manager')
        ? req.user.id
        : null;
}

/**
 * Helper to extract customer ID from authenticated user
 * @param {Object} req - Request object
 * @returns {number|null} Customer ID or null
 */
export function getAuthCustomerId(req) {
    return req.user && req.user.role === 'customer'
        ? req.user.id
        : null;
}

/**
 * Helper to check if user is a manager
 * @param {Object} req - Request object
 * @returns {boolean} True if user is a manager
 */
export function isManager(req) {
    return req.user && req.user.role === 'manager';
}

/**
 * Helper to check if user is an employee (or manager)
 * @param {Object} req - Request object
 * @returns {boolean} True if user is an employee or manager
 */
export function isEmployee(req) {
    return req.user && (req.user.role === 'employee' || req.user.role === 'manager');
}

/**
 * Helper to check if user is a customer
 * @param {Object} req - Request object
 * @returns {boolean} True if user is a customer
 */
export function isCustomer(req) {
    return req.user && req.user.role === 'customer';
}

/**
 * Helper to verify ownership of a resource
 * Use this inside route handlers for ownership checks
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} resourceId - ID of the resource being accessed
 * @returns {boolean} True if user owns resource or is manager
 */
export function verifyOwnership(req, res, resourceId) {
    return checkOwnership(req, res, resourceId);
}

