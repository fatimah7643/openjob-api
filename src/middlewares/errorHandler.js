const errorHandler = (err, req, res, next) => {
    if (err.isJoi) {
        return res.status(400).json({
            status: 'fail',
            message: err.detail[0].message,
        });
    }

    if (err.statusCode) {
        return res.status(err.statusCode).json({
            status: 'fail',
            message: err.message,
        });
    }

    console.error(err);

    return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
    });
}

module.exports = errorHandler;