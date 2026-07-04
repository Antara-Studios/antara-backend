import cors from 'cors';

const setupCors = (app) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : [];
    // CORS configuration
    const corsOptions = {
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) {
                console.warn('CORS: No origin header present - allowing with wildcard');
                return callback(null, true);
            }

            // Check if the origin is in the allowed list (case-insensitive)
            const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

            if (allowedOrigins.some(allowed =>
                allowed.endsWith('/')
                    ? allowed.slice(0, -1).toLowerCase() === normalizedOrigin.toLowerCase()
                    : allowed.toLowerCase() === normalizedOrigin.toLowerCase()
            )) {
                return callback(null, true);
            }

            // For development, log and allow all origins
            if (process.env.NODE_ENV !== 'production') {
                console.warn(`CORS: Allowing non-whitelisted origin in development: ${origin}`);
                return callback(null, true);
            }

            // In production, only allow whitelisted origins
            console.warn(`CORS: Blocked request from origin: ${origin}`);
            return callback(new Error(`Not allowed by CORS. Origin ${origin} is not in the allowed list.`), false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
            'X-Auth-Token',
            'X-CSRF-Token',
            'X-Forwarded-For',
            'X-Forwarded-Host'
        ],
        exposedHeaders: [
            'Content-Length',
            'Content-Type',
            'Authorization',
            'Set-Cookie'
        ],
        maxAge: 86400, // 24 hours
        preflightContinue: false,
        optionsSuccessStatus: 200
    };

    // Apply CORS middleware with our configuration
    app.use(cors(corsOptions));

    // Log CORS headers for debugging
    app.use((req, res, next) => {
        console.log('CORS Request:', {
            url: req.originalUrl,
            method: req.method,
            origin: req.headers.origin,
            'access-control-request-headers': req.headers['access-control-request-headers'],
            'access-control-request-method': req.headers['access-control-request-method'],
            'user-agent': req.headers['user-agent']
        });
        next();
    });
};

export { setupCors };
export default setupCors;
