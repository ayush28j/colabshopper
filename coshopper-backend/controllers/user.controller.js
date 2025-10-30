const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
*/
exports.authenticate = async (req, res, next) => {
    try{
        if(req.userId)
            return next();
        else
            return res.status(401).json({ error: 'Unauthorized' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/**
 * @param {Request} req
 * @param {Response} res
 */
exports.register = async (req, res) => {
    try{
        const { name, email, password, country } = req.body;
        if(!name)
            return res.status(400).json({ error: 'Name is required' });
        if(!email)
            return res.status(400).json({ error: 'Email is required' });
        if(!password)
            return res.status(400).json({ error: 'Password is required' });
        if(!country)
            return res.status(400).json({ error: 'Country is required' });
        if(await User.findOne({ email }))
            return res.status(400).json({ error: 'An account with this email already exists' });
        const user = await new User({ name, email, password, country }).save();
        const access = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const refresh = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ access, refresh });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * @param {Request} req
 * @param {Response} res
 */
exports.login = async (req, res) => {
    try{
        const { email, password } = req.body;
        if(!email)
            return res.status(400).json({ error: 'Email is required' });
        if(!password)
            return res.status(400).json({ error: 'Password is required' });
        const user = await User.findOne({ email });
        if(!user)
            return res.status(400).json({ error: 'User not found' });
        if(user.validatePassword(password))
            return res.status(400).json({ error: 'Invalid password' });
        const access = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const refresh = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(200).json({ access, refresh });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * @param {Request} req
 * @param {Response} res
 */
exports.refreshToken = async (req, res) => {
    try{
        const { refreshToken } = req.body;
        if(!refreshToken)
            return res.status(400).json({ error: 'Refresh token is required' });
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        if(!decoded.id)
            return res.status(400).json({ error: 'Invalid refresh token' });
        if(decoded.exp < Date.now() / 1000)
            return res.status(400).json({ error: 'Refresh token expired' });
        const user = await User.findById(oid(decoded.id));
        if(!user)
            return res.status(400).json({ error: 'User not found' });
        const access = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const refresh = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(200).json({ access, refresh });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getUser = async (req, res) => {
    try{
        const user = await User.findById(req.userId);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}