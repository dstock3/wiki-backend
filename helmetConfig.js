const helmet = require('helmet');

module.exports = function(app) {
    app.use(helmet());
    
    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            connectSrc: ["'self'"],
            upgradeInsecureRequests: []
        }
    }));

    app.use(helmet.frameguard({ action: 'sameorigin' }));
    app.use(helmet.dnsPrefetchControl({ allow: true })); 
    app.use((req, res, next) => {
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=()');
        next();
    });
    
    app.use(helmet.hidePoweredBy());
};