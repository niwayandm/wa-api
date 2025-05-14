import pino from 'pino';
import path from 'path';
import { createStream } from 'rotating-file-stream';
import { ENVIRONMENTS, LOG_LEVELS } from '../config/constants';

const isProd = process.env.NODE_ENV === ENVIRONMENTS.PRODUCTION;

let baseLogger: pino.Logger;

if (isProd) {
    const logDirectory = path.join(process.cwd(), 'logs');

    const stream = createStream('app.log', {
        interval: '1d',
        path: logDirectory,
        maxFiles: 30,
        compress: 'gzip',
    });

    baseLogger = pino(
        {
            level: LOG_LEVELS.INFO,
        },
        stream
    );
} else {
    baseLogger = pino({
        level: LOG_LEVELS.DEBUG,
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        },
    });
}

export const logger = {
    base: baseLogger,
    whatsapp: baseLogger.child({ module: 'whatsapp' }),
    baileys: baseLogger.child({ module: 'baileys', level: isProd ? 'silent' : LOG_LEVELS.INFO }),
    sync: baseLogger.child({ module: 'sync' }),
    message: baseLogger.child({ module: 'message' }),
    server: baseLogger.child({ module: 'server' }),
    auth: baseLogger.child({ module: 'auth' }),
};
