// Instanciating the "Error" object of the "ExpressError" class:
class ExpressError extends Error {
    // The object is created by the dynamic "message" and "statusCode" parameters
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;