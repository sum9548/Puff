
/* ============================================================
   gameLoop.js - the heartbeat of the server.
   30 times a second, for every room:
     1. move to the next phase if its timer is done
     2. let bots think, then run the physics
     3. send the new "photo of the table" to everyone in the room
   ============================================================ */

import { CFG } from './config.js';
import { rooms } from './rooms.js';
import { stepPhysics } from './physics.js';
import { thinkBots } from './bots.js';
import { snapshot } from './snapshot.js';

export function startGameLoop(io) {
  let lastTick = Date.now();

  setInterval(() => {
    const now = Date.now();
    const dt = Math.min(0.1, (now - lastTick) / 1000);
    lastTick = now;

    rooms.forEach((room) => {
      // Countdown and pause timers.
      const timerDone = now >= room.phaseEnd;

      if (
        (room.phase === 'countdown' || room.phase === 'pause') &&
        timerDone
      ) {
        room.phase = 'playing';
      }

      if (room.phase === 'playing') {
        thinkBots(room, now);
        stepPhysics(room, dt, now);
      }

      io.to(room.code).emit('state', snapshot(room, now));
    });
  }, 1000 / CFG.TICK_RATE);
}
