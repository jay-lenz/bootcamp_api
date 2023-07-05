const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/User')

exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // console.log(req.headers.authorization)
        token = req.headers.authorization.split(' ')[1];
    }
    // else if (req.cookies.token) {
    //     token = req.cookies.token
    // }

    if (!token) {
        return next(new ErrorResponse(`Not Authorized to access this route`, 401))
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log(decoded)

        req.user = await User.findById(decoded.id)
        next()
    } catch (error) {
        return next(new ErrorResponse(`Not Authorized to access this route ${error.message}`, 401))

    }
})


exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is un authorized to access this route`, 403))
        }
        next();
    }
}