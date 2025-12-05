//
//
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.success = false;  // Always set success to false for errors
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.pyd = {}

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError   