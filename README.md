# API with Baileys

This project is a simple Node.js/TypeScript-based backend service using the [Baileys](https://github.com/WhiskeySockets/Baileys) library to integrate WhatsApp messaging. It exposes RESTful API endpoints and manages WhatsApp sessions securely. 

This project serves as a personal learning exercise for me to understand websocket on Node.js and to gain experience building backend on Node.js using Typescript.

## Features

- WhatsApp integration using Baileys
- REST API for sending messages to private chats and getting all messages
- API key-based authentication
- Logging with Pino
- Rate limit and IP restriction


## Prerequisites

- Node.js (v20+ recommended)
- TypeScript


## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
```

Or if you want to run in development:
```bash
npm run dev
```

## API Overview

All endpoints require an `x-api-key` header for authentication. The program will print the key once in console whenever you connect.


### `GET /chats`

Retrieve the list of all chats from the connected WhatsApp account.

**Request:**

```bash
curl -X GET http://localhost:3000/chats \
  -H "x-api-key: YOUR_API_KEY"
```

**Response:**

```json
[
  {
    "010204098231@s.whatsapp.net": {
      "id": "010204098231@s.whatsapp.net",
      "participant": [],
      "unreadCount": 0,
      "readOnly": false,
      ...
    },
    ...
  },
  ...
]
```

---

### `POST /send-text`

Send a plain text message to a WhatsApp contact or group.

**Example Request (CURL):**

```bash
curl -X POST http://localhost:3000/send-text \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "to": "+6281234567890",
    "message": "Hello from CURL!"
}'
```

**Response:**

```json
{ "success": true }
```
Only Indonesian numbers (+62) are supported without a country code. To use numbers from other countries, include the full international format (with country code) in the `to` parameter.

---

### `POST /send-image`

Send an image with an optional caption.

**Example Request (CURL):**

```bash
curl -X POST http://localhost:3000/send-image \
  -H "x-api-key: YOUR_API_KEY" \
  -F "to=1234567890" \
  -F "text=Optional caption" \
  -F "file=@/path/to/image.jpg"
```

**Response:**

```json
{ "success": true }
```

---

### `POST /send-document`

Send a document/media file (PDF, DOCX, etc.) without image preview. Caption is also optional.

**Example Request (CURL):**

```bash
curl -X POST http://localhost:3000/send-document \
  -H "x-api-key: YOUR_API_KEY" \
  -F "to=1234567890" \
  -F "text=Optional document message" \
  -F "file=@/path/to/document.pdf"
```

**Response:**

```json
{ "success": true }
```


## To-do List

- Country number support
- Send messages to group and group handling
- Multi-number session handling
- API key re-generation
- Disconnect sessions
- Per-session logging or metrics (uptime, message counts)
- Webhook or polling endpoint for incoming messages
- Sent message status tracking (sent, delivered, read)


## Credits

Huge thanks for [Baileys](https://github.com/WhiskeySockets/Baileys) library for making this project possible! 
