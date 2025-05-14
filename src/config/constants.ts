export const ENVIRONMENTS = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
} as const;

export const LOG_LEVELS = {
    TRACE: 'trace',
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    FATAL: 'fatal',
} as const;

export const ALLOWED_IPS = [
    ...((process.env.ALLOWED_IPS || '').split(',').filter(Boolean)),
    '127.0.0.1',
    '::1'
];