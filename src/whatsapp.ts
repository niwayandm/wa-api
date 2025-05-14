import makeWASocket, {
    makeInMemoryStore,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
    WASocket
} from 'baileys';
import * as qrcode from 'qrcode';
import { Boom } from '@hapi/boom';
import { logger } from './logs/logger';
import { ENVIRONMENTS } from './config/constants';
import { generateApiKey, storeApiKey } from './utils/keyManager';

const store = makeInMemoryStore({});
store.readFromFile('./baileys_store.json');

const isDev = process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT;

setInterval(() => {
    store.writeToFile('./baileys_store.json');
}, 10_000);

let sock: WASocket;

export async function initWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: isDev,
        logger: logger.baileys,
    });

    store.bind(sock.ev);

    logger.whatsapp.info('WhatsApp socket initialized');

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {

        if (qr) {
            if (!isDev) {
                try {
                    await qrcode.toFile('./qr.png', qr);
                    logger.whatsapp.info('QR code saved to qr.png');
                } catch (err) {
                    logger.whatsapp.error({ err }, 'Failed to save QR code');
                }
            }
        }

        if (connection === 'close') {
            const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
            const shouldReconnect = reason !== DisconnectReason.loggedOut;

            logger.whatsapp.warn({ reason, shouldReconnect }, 'WhatsApp connection closed');

            if (shouldReconnect) {
                logger.whatsapp.info('Reconnecting...');
                await initWhatsApp();
            } else {
                logger.whatsapp.warn('Session logged out. Manual re-authentication required.');
                await initWhatsApp();
            }
        } else if (connection === 'open') {
            const sessionId = sock.user?.id!;
            const apiKey = generateApiKey();
            storeApiKey(sessionId, apiKey);

            logger.auth.info(`Session authenticated`);
            logger.auth.info(`Session ID: ${sessionId}`);
            logger.auth.info(`API Key: ${apiKey}`);
            console.log(`API Key: ${apiKey}`);

            // Optional: save to file for testing
            require('fs').writeFileSync(
                './auth-session.json',
                JSON.stringify({ sessionId, apiKey }, null, 2)
            );
        }
    });
}

export function getSocket(): WASocket {
    return sock;
}

export function getStore() {
    return store;
}