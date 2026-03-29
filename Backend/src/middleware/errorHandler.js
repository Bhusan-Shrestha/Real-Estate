export function notFoundHandler(req, res, next) {
    return res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
}

export function errorHandler(error, req, res, next) {
    console.error(error);

    if (error?.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON payload'
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
}