function errorHandler(err, req, res, next) {
    // jwt authorization error
    if (err.name === 'UnauthorizedError') {
        res.status(401).send({ message: 'User is not authorized' });
    }
    
    // validation error
    if (err.name === 'ValidationError') {
        res.status(401).send({ message: err})
    }
    
    // general error
    res.status(500).send({ message: err.message })
}

module.exports = errorHandler;
