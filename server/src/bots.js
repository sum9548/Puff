
/* ============================================================
   bots.js - a very simple "brain" for computer players.
   Rule: if the ball is on my half of the table, blow it away.
   Bots react a little slowly and miss sometimes, so humans can win.
   ============================================================ */

import { CFG } from './config.js';

export function thinkBots(room, now) {
  const mid = CFG.ARENA / 2;

  room.players.forEach((p) => {
    if (!p.isBot || !p.alive || now < p.nextThink) return;

    // Think again in 150-400 ms (humans are not instant, bots shouldn't be either).
    p.nextThink = now + 150 + Math.random() * 250;

    // How far is the ball from my edge? (0 = touching my edge)
    const b = room.ball;
    const distToMyEdge = [b.y, CFG.ARENA - b.x, CFG.ARENA - b.y, b.x][p.seat];

    const ballOnMyHalf = distToMyEdge < mid + 10;
    const hasEnergy = p.energy > 12; // don't blow until overheated

    // 70% keeps bots beatable.
    p.blowing = ballOnMyHalf && hasEnergy && Math.random() < 0.7;
  });
}
