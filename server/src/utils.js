
/* ============================================================
   utils.js - tiny helper functions that don't belong anywhere else.
   ============================================================ */

import { CFG } from './config.js';

// Clean up a name typed by a player: letters, numbers, space, _ and - only.
// This also stops people sneaking HTML into names.
export function cleanName(name) {
  const cleaned = String(name || '')
    .replace(/[^\p{L}\p{N} _-]/gu, '')
    .trim()
    .slice(0, CFG.NAME_MAX);

  return cleaned || 'Player';
}

// Pick a random 4-character room code like "KQ7F".
// No I, O, 0 or 1, so codes are never confused when read out loud.
export function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  return Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}
