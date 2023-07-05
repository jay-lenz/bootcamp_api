const ErrorResponse = require('../utils/errorResponse')

const errorHandler = (err, req, res, next) => {
    let error = { ...err }
    error.message = err.message

    console.log(err)
    console.log(err.name.yellow)
    if (err.name === 'CastError') {
        const message = `Resource not found`
        error = new ErrorResponse(message, 404)
    }

    //duplicate key handler
    if (err.code === 11000) {
        const message = 'Duplicate field entered';
        error = new ErrorResponse(message, 400)
    }

    //model validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(x => x.message)
        error = new ErrorResponse(message, 400)
    }
    console.log(err.message)
    res.status(error.statusCode || 500).json({
        succes: false,
        error: error.message || 'Server Error'
    })
}

module.exports = errorHandler