// Secret key for JWT - in production, this should be in environment variables
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = 7 * 24 * 60 * 60; // Token expires in 7 days (in seconds)

function base64UrlEncode(input) {
    const value = typeof input === 'string' ? input : JSON.stringify(input);
    return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(input) {
    return Buffer.from(input, 'base64url').toString();
}

function createSignature(payload) {
    return crypto
        .createHmac('sha256', JWT_SECRET)
        .update(payload)
        .digest('base64url');
}

function timingSafeEquals(a, b) {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
        return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
}

function generateToken(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresIn = JWT_EXPIRES_IN;
    const exp = issuedAt + expiresIn;

    const tokenPayload = {
        ...payload,
        iat: issuedAt,
        exp,
    };

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(tokenPayload);
    const signature = createSignature(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}


function verifyToken(token) {
    if (!token || typeof token !== 'string') {
        throw new Error('Token missing');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid token structure');
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = createSignature(`${encodedHeader}.${encodedPayload}`);
    if (!timingSafeEquals(signature, expectedSignature)) {
        throw new Error('Invalid token signature');
    }

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(payloadJson);
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
        throw new Error('Token expired');
    }

    return payload;
}

/**
 * Authenticates JWT token from Authorization header
 * Returns the decoded user or sends error response
 * @param {Object} req - Node HTTP request object
 * @param {Object} res - Node HTTP response object
 * @returns {Object|null} Decoded user object if valid, null if invalid (response sent)
 */
function authenticate(req, res) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');  
            res.end(JSON.stringify({
                success: false,
                error: 'Authentication required. Please provide a valid token.'
            }));
            return null;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const decoded = verifyToken(token);

        // Attach user info to request object
        req.user = decoded;
        return decoded;
    } catch (error) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');  
        res.end(JSON.stringify({
            success: false,
            error: 'Invalid or expired token. Please log in again.'
        }));
        return null;
    }
}

/**
 * Checks if authenticated user has required role(s)
 * @param {Object} req - Node HTTP request object with req.user
 * @param {Object} res - Node HTTP response object
 * @param {...string} allowedRoles - Roles that are allowed
 * @returns {boolean} True if authorized, false if not (response sent)
 */
function checkRole(req, res, ...allowedRoles) {
    if (!req.user) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');  
        res.end(JSON.stringify({  
            success: false,
            error: 'Authentication required'
        }));
        return false;
    }

    if (!allowedRoles.includes(req.user.role)) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');  
        res.end(JSON.stringify({
            success: false,
            error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
        }));
        return false;
    }

    return true;
}

/**
 * Checks if user is accessing their own resource or is a manager
 * @param {Object} req - Node HTTP request object with req.user
 * @param {Object} res - Node HTTP response object
 * @param {number} resourceId - ID of the resource being accessed
 * @returns {boolean} True if authorized, false if not (response sent)
 */
function checkOwnership(req, res, resourceId) {
    if (!req.user) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');  
        res.end(JSON.stringify({
            success: false,
            error: 'Authentication required'
        }));
        return false;
    }

    const userId = req.user.id;

    // Managers can access any resource
    if (req.user.role === 'manager') {
        return true;
    }

    // Check if user is accessing their own resource
    if (userId !== parseInt(resourceId)) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');  
        res.end(JSON.stringify({
            success: false,
            error: 'Access denied. You can only access your own resources.'
        }));
        return false;
    }

    return true;
}

export {
    generateToken,
    verifyToken,
    authenticate,
    checkRole,
    checkOwnership,
    JWT_SECRET
};
