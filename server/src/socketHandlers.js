
/* ============================================================
   socketHandlers.js - everything players can SAY to the server.
   Players can create a room, join a room, blow, and start the game.
   Each handler checks the request before updating the room.
   ============================================================ */

import { CFG, BOT_NAMES } from './config.js';

import {
  getRoom,
  createRoom,
  addPlayer,
  removePlayer,
  startGame,
  backToLobby,
  rooms,
} from './rooms.js';

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    // Find my room and check if I am the host.
    const myRoom = () => rooms.get(socket.data.code);
    const isHost = (room) => !!room && room.hostId === socket.id;

    socket.on('createRoom', ({ name }, reply) => {
      const room = createRoom(socket.id, name);

      socket.data.code = room.code;
      socket.join(room.code);

      reply({ ok: true, code: room.code });
    });

    socket.on('joinRoom', ({ name, code }, reply) => {
      const room = getRoom(code);

      if (!room) {
        return reply({
          ok: false,
          error: "We couldn't find that room. Check the code and try again.",
        });
      }

      if (room.phase !== 'lobby') {
        return reply({
          ok: false,
          error: 'That game has already started. Ask for a new room.',
        });
      }

      if (room.players.length >= CFG.MAX_PLAYERS) {
        return reply({
          ok: false,
          error: 'That room is full (4 players max).',
        });
      }

      addPlayer(room, socket.id, name);

      socket.data.code = room.code;
      socket.join(room.code);

      return reply({ ok: true, code: room.code });
    });

    // Player holds (true) or releases (false) the blow button.
    socket.on('blow', (isBlowing) => {
      const room = myRoom();
      if (!room) return;

      const player = room.players.find((p) => p.id === socket.id);

      if (player && player.alive) {
        player.blowing = !!isBlowing;
      }
    });

    socket.on('addBot', () => {
      const room = myRoom();

      if (
        !isHost(room) ||
        room.phase !== 'lobby' ||
        room.players.length >= CFG.MAX_PLAYERS
      ) {
        return;
      }

      const botCount = room.players.filter((p) => p.isBot).length;

      addPlayer(
        room,
        `bot-${Date.now()}-${botCount}`,
        BOT_NAMES[botCount % BOT_NAMES.length],
        true
      );
    });

    socket.on('removeBot', () => {
      const room = myRoom();

      if (!isHost(room) || room.phase !== 'lobby') return;

      const index = room.players.map((p) => p.isBot).lastIndexOf(true);

      if (index >= 0) {
        room.players.splice(index, 1);
      }
    });

    socket.on('startGame', () => {
      const room = myRoom();

      if (
        !isHost(room) ||
        room.phase !== 'lobby' ||
        room.players.length < 2
      ) {
        return;
      }

      startGame(room);
    });

    socket.on('playAgain', () => {
      const room = myRoom();

      if (!isHost(room) || room.phase !== 'ended') return;

      backToLobby(room);
    });

    // Leaving on purpose and losing the connection are handled the same way.
    const leave = () => {
      const room = myRoom();
      if (!room) return;

      socket.leave(room.code);
      removePlayer(room, socket.id);
      socket.data.code = null;
    };

    socket.on('leaveRoom', leave);
    socket.on('disconnect', leave);
  });
}
