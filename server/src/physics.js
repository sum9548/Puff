
/* ============================================================
   physics.js - how the ball moves. Analogy: a ping-pong ball
   on a table. Each fan is a hair dryer pointing at the middle.
   The ball slows down by itself and bounces off empty sides.
   ============================================================ */

import { CFG, PUSH_DIR } from './config.js';
import { centreBall, say, checkWinner } from './rooms.js';

// Called when the ball touches a side. Returns true if a life was lost.
function loseLife(room, seat) {
  const owner = room.players.find((p) => p.seat === seat && p.alive);

  if (!owner) return false; // empty or knocked-out side = wall, no life lost

  owner.lives -= 1;
  say(room, `${owner.name} lost a life`);

  if (owner.lives <= 0) {
    owner.alive = false;
    owner.blowing = false;
    say(room, `${owner.name} is out!`, 2200);
  }

  centreBall(room);
  room.phase = 'pause';
  room.phaseEnd = Date.now() + CFG.PAUSE_MS;
  checkWinner(room); // may switch the phase to 'ended'

  return true;
}

// Step 1: fans use energy and push the ball.
function updateFans(room, dt, now) {
  const ball = room.ball;

  room.players.forEach((p) => {
    if (!p.alive) return;

    // Finished cooling down after an overheat?
    if (p.overheatUntil && now >= p.overheatUntil) {
      p.overheatUntil = 0;
      p.energy = CFG.OVERHEAT_RESTART;
    }

    const overheated = p.overheatUntil > 0;

    if (p.blowing && !overheated) {
      p.energy -= CFG.ENERGY_DRAIN * dt;

      const dir = PUSH_DIR[p.seat];
      ball.vx += dir.x * CFG.PUSH * dt;
      ball.vy += dir.y * CFG.PUSH * dt;

      if (p.energy <= 0) {
        // Blew too long: the fan overheats!
        p.energy = 0;
        p.overheatUntil = now + CFG.OVERHEAT_MS;
        p.blowing = false;
      }
    } else if (!overheated) {
      p.energy = Math.min(
        CFG.ENERGY_MAX,
        p.energy + CFG.ENERGY_REGEN * dt
      );
    }
  });
}

// Step 2: slow the ball a little and cap its speed.
function applyFriction(ball) {
  ball.vx *= CFG.FRICTION;
  ball.vy *= CFG.FRICTION;

  const speed = Math.hypot(ball.vx, ball.vy);

  if (speed > CFG.MAX_SPEED) {
    ball.vx = (ball.vx / speed) * CFG.MAX_SPEED;
    ball.vy = (ball.vy / speed) * CFG.MAX_SPEED;
  }
}

// Step 4: touching a side with a live player = that player loses a life.
// Touching a side with nobody = a wall, so the ball just bounces.
// Returns true if the round ended because of a lost life.
function checkEdges(room) {
  const b = room.ball;
  const R = CFG.BALL_R;
  const A = CFG.ARENA;

  if (b.y - R <= 0) {
    // Top edge = seat 0
    if (loseLife(room, 0)) return true;
    b.y = R;
    b.vy = Math.abs(b.vy) * 0.8;
  }

  if (b.x + R >= A) {
    // Right edge = seat 1
    if (loseLife(room, 1)) return true;
    b.x = A - R;
    b.vx = -Math.abs(b.vx) * 0.8;
  }

  if (b.y + R >= A) {
    // Bottom edge = seat 2
    if (loseLife(room, 2)) return true;
    b.y = A - R;
    b.vy = -Math.abs(b.vy) * 0.8;
  }

  if (b.x - R <= 0) {
    // Left edge = seat 3
    if (loseLife(room, 3)) return true;
    b.x = R;
    b.vx = Math.abs(b.vx) * 0.8;
  }

  return false;
}

// One physics tick: fans -> friction -> move -> edges.
export function stepPhysics(room, dt, now) {
  updateFans(room, dt, now);
  applyFriction(room.ball);

  // Step 3: move the ball.
  room.ball.x += room.ball.vx * dt;
  room.ball.y += room.ball.vy * dt;

  checkEdges(room);
}
