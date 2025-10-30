const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

function oid(id) {
    if(typeof id === 'string')
        return new mongoose.Types.ObjectId(id);
    else return id;
}


/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
*/

/**
 * Authentication middleware that checks for JWT token in Authorization header.
 * If token exists and is valid, decodes it and attaches userId to the request object.
 * If token is missing or invalid, the request continues but req.userId will be undefined.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
module.exports = (req, res, next) => {
    try {
        // Get the Authorization header
        const authHeader = req.headers.authorization;
        
        // Check if Authorization header exists
        if (!authHeader) {
            // No token present, continue without setting userId
            return next();
        }
        
        // Extract token from "Bearer <token>" format
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;
        
        // Verify and decode the token
        if (process.env.JWT_SECRET) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Extract userId from decoded token and attach to request
            if (decoded.id) {
                if(decoded.exp > Date.now() / 1000)
                    req.userId = oid(decoded.id);
            
            }
        }
        
        // Continue to next middleware
        next();
    } catch (error) {
        // If token verification fails, continue without setting userId
        // This allows public routes to work even with invalid tokens
        next();
    }
};

