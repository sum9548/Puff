
/* ============================================================
   config.js - every game setting in ONE place.
   Want the game faster, easier or longer? Change numbers here.
   ============================================================ */

export const CFG = {
  ARENA: 600,           // arena is a 600 x 600 square (logical units)
  BALL_R: 22,            // ball radius
  PUSH: 700,             // how hard one fan pushes the ball (units / sec^2)
  FRICTION: 0.985,       // ball slows slightly every tick (1 = never slows)
  MAX_SPEED: 420,        // speed limit so the ball never becomes unfair
  TICK_RATE: 30,         // game updates per second
  LIVES: 3,              // lives each player starts with
  ENERGY_MAX: 100,       // fan energy bar size
  ENERGY_DRAIN: 40,      // energy used per second while blowing
  ENERGY_REGEN: 20,      // energy gained per second while resting
  OVERHEAT_MS: 2000,     // how long a fan is dead after hitting 0 energy
  OVERHEAT_RESTART: 30,  // energy a fan restarts with after cooling down
  COUNTDOWN_MS: 3000,    // 3-2-1 before the game starts
  PAUSE_MS: 1500,        // pause after someone loses a life
  MAX_PLAYERS: 4,
  NAME_MAX: 12,          // longest allowed player name
};

// Seats go around the square: 0 = top, 1 = right, 2 = bottom, 3 = left.
// Two players should face each other, so seats are handed out in this order.
export const SEAT_ORDER = [0, 2, 1, 3];

// The direction each seat's fan pushes the ball (towards the centre).
export const PUSH_DIR = [
  { x: 0, y: 1 },   // top fan pushes DOWN
  { x: -1, y: 0 },  // right fan pushes LEFT
  { x: 0, y: -1 },  // bottom fan pushes UP
  { x: 1, y: 0 },   // left fan pushes RIGHT
];

export const BOT_NAMES = ['Bolt', 'Gust', 'Breezy', 'Zephyr'];
