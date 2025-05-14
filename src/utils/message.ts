
import { getStore, getSocket } from '../whatsapp';
import { writeFileSync, unlinkSync } from 'fs';
import mime from 'mime-types';
import * as fs from 'fs';


export async function sendText(to: string, message: string) {
    const sock = getSocket();
    return await sock.sendMessage(to, { text: message });
}

export async function sendImage(to: string, media: Express.Multer.File, text?: string) {
    const sock = getSocket();

    const buffer = fs.readFileSync(media.path);
    const mimeType = media.mimetype;
    const fileName = media.originalname;

    const message = {
        image: buffer,
        mimetype: mimeType,
        fileName,
        caption: text || '',
    };

    await sock.sendMessage(to, message);
}

export async function sendDocument(to: string, media: Express.Multer.File, text?: string) {
    const sock = getSocket();

    const buffer = fs.readFileSync(media.path);
    const mimeType = media.mimetype;
    const fileName = media.originalname;

    const message = {
        document: buffer,
        mimetype: mimeType,
        fileName,
        caption: text || '',
    };

    await sock.sendMessage(to, message);
}


export async function getChats() {
    const store = getStore();
    return Object.values(store.chats);
}