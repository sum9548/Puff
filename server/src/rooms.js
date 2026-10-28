
/* ============================================================
   rooms.js - the "guest list" of the game.
   Keeps every room in memory and knows how to create a room,
   add/remove players, start a game and decide who has won.
   (No physics here - that lives in physics.js.)
   ============================================================ */

import { CFG, SEAT_ORDER } from './config.js';
import { cleanName, randomCode } from './utils.js';

// All active rooms. Key = 4-character room code, value = room object.
export const rooms = new Map();

/* ---------- Small helpers ---------- */

export function getRoom(code) {
  return rooms.get(String(code || '').toUpperCase().trim());
}

function makeUniqueCode() {
  let code;

  do {
    code = randomCode();
  } while (rooms.has(code));

  return code;
}

export function centreBall(room) {
  const mid = CFG.ARENA / 2;
  room.ball = { x: mid, y: mid, vx: 0, vy: 0 };
}

function freeSeat(room) {
  const taken = room.players.map((p) => p.seat);
  return SEAT_ORDER.find((s) => !taken.includes(s));
}

// Show a short message on every screen for a moment.
export function say(room, text, ms = 1800) {
  room.message = text;
  room.messageUntil = Date.now() + ms;
}

/* ---------- Players ---------- */

function newPlayer(room, id, name, isBot) {
  return {
    id,
    name: cleanName(name),
    isBot,
    seat: freeSeat(room),
    lives: CFG.LIVES,
    energy: CFG.ENERGY_MAX,
    blowing: false,
    overheatUntil: 0, // timestamp; 0 means the fan is fine
    alive: true,
    connected: true,
    nextThink: 0, // bots only: when to make the next decision
  };
}

function resetPlayers(room) {
  // Drop anyone who left during the last game, then refill everyone.
  room.players = room.players.filter((p) => p.connected);

  room.players.forEach((p) => {
    p.lives = CFG.LIVES;
    p.energy = CFG.ENERGY_MAX;
    p.blowing = false;
    p.overheatUntil = 0;
    p.alive = true;
  });
}

/* ---------- Room life cycle ---------- */

export function createRoom(hostId, hostName) {
  const code = makeUniqueCode();

  const room = {
    code,
    hostId,
    phase: 'lobby', // lobby -> countdown -> playing <-> pause -> ended
    players: [],
    ball: null,
    phaseEnd: 0, // timestamp when the current phase finishes
    message: '',
    messageUntil: 0,
    winnerId: null,
  };

  centreBall(room);
  room.players.push(newPlayer(room, hostId, hostName, false));
  rooms.set(code, room);

  return room;
}

export function addPlayer(room, id, name, isBot = false) {
  room.players.push(newPlayer(room, id, name, isBot));
}

// If only one player (or nobody) is still alive, the game is over.
export function checkWinner(room) {
  const alive = room.players.filter((p) => p.alive);

  if (alive.length <= 1) {
    room.phase = 'ended';
    room.winnerId = alive[0] ? alive[0].id : null;

    room.players.forEach((p) => {
      p.blowing = false;
    });

    centreBall(room);
  }
}

export function removePlayer(room, id) {
  const player = room.players.find((p) => p.id === id);

  if (!player) return;

  if (room.phase === 'lobby' || room.phase === 'ended') {
    room.players = room.players.filter((p) => p.id !== id);
  } else {
    // Mid-game: keep them on the table but knocked out,
    // so their side becomes a wall.
    player.connected = false;
    player.alive = false;
    player.lives = 0;
    player.blowing = false;

    say(room, `${player.name} left the game`);
  }

  // If no real people are left, close the room.
  const humans = room.players.filter((p) => !p.isBot && p.connected);

  if (humans.length === 0) {
    rooms.delete(room.code);
    return;
  }

  // If the host left, pass the crown to the next human.
  if (room.hostId === id) {
    room.hostId = humans[0].id;
  }

  if (['countdown', 'playing', 'pause'].includes(room.phase)) {
    checkWinner(room);
  }
}

export function startGame(room) {
  resetPlayers(room);
  centreBall(room);
  room.winnerId = null;
  room.phase = 'countdown';
  room.phaseEnd = Date.now() + CFG.COUNTDOWN_MS;
}

export function backToLobby(room) {
  resetPlayers(room);
  room.phase = 'lobby';
}
