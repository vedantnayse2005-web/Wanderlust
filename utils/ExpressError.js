class ExpressError extends Error {
    constructor(message, statusCode) {
        super(message);   // pass message to Error

        this.statusCode = statusCode;

        // Optional but recommended
        this.name = "ExpressError";
    }
}

module.exports = ExpressError;