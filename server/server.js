
import 'dotenv/config';

import path from 'node:path';
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';

import { startGameLoop } from './src/gameLoop.js';
import { registerSocketHandlers } from './src/socketHandlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const clientDist = path.join(__dirname, '..', 'client', 'dist');

app.get('/health', (_req, res) => {
  res.json({ ok: true, game: 'Puff' });
});

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/socket.io')) {
      return next();
    }

    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res
      .status(503)
      .send('Puff frontend is not built yet. Run `npm run build` first.');
  });
}

registerSocketHandlers(io);
startGameLoop(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Puff server listening on port ${PORT}`);
});
