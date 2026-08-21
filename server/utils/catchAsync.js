// A middleware to return the function of error-handling
module.exports = func => {
    // The returned function accepts 3 inputs that will be used as the inputs of the returned function + the catch block:
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}