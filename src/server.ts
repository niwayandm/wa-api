import express, { Request, Response } from 'express';
import multer from 'multer';
import { dynamicApiKeyMiddleware, rateLimiter, ipRestrictionMiddleware  } from './middleware/security';
import { requestLogger } from './middleware/log';
import { logger } from './logs/logger';
import { initWhatsApp } from './whatsapp';
import { sendText, sendImage, sendDocument, getChats } from './utils/message';
import { formatPhoneNumber } from './utils/helpers';

const app = express();
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

app.use(express.json());
app.use(requestLogger); // Log all requests
app.use(rateLimiter); // Rate limiting middleware
app.use(ipRestrictionMiddleware); // IP allowlist check
app.use(dynamicApiKeyMiddleware); // API key auth middleware
app.use((req, res, next) => dynamicApiKeyMiddleware(req, res, next));

// Get all chats
app.get('/chats', async (req: Request, res: Response): Promise<void> => {
    try {
        const chats = await getChats();
        res.json(chats);
    } catch (err) {
        logger.server.error('Failed to send message:', err);
        res.status(500).json({
            error: 'Failed to send message',
        });
    }
});

// Send a text message
app.post('/send-text', async (req: Request, res: Response): Promise<void> => {
    let { to, message } = req.body;
    try {
        to = formatPhoneNumber(to);
        await sendText(to, message);
        res.json({ success: true });
    } catch (err) {
        logger.server.error('Error in /send-text:', err);
        res.status(500).json({
            error: 'Failed to send message',
        });
    }
});

// Send image file
app.post('/send-image', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    const { to, text } = req.body;
    const media = req.file;

    if (!to || !media) {
        res.status(400).send('Missing "to" or image file');
        return;
    }

    try {
        const phoneNumber = formatPhoneNumber(to);
        await sendImage(phoneNumber, media, text);
        res.json({ success: true });
    } catch (error) {
        logger.server.error('Error in /send-image:', error);
        res.status(500).json({ error: 'Failed to send image' });
    }
});

// Send media (not using image preview)
app.post('/send-document', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    const { to, text } = req.body;
    const media = req.file;

    if (!to || !media) {
        res.status(400).send('Missing "to" or document file');
        return;
    }

    try {
        const phoneNumber = formatPhoneNumber(to);
        await sendDocument(phoneNumber, media, text);
        res.json({ success: true });
    } catch (error) {
        logger.server.error('Error in /send-document:', error);
        res.status(500).json({ error: 'Failed to send document' });
    }
});

app.listen(3000, async () => {
    console.log('API server running on http://localhost:3000');
    await initWhatsApp();
});
