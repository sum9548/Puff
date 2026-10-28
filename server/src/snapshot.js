
/* ============================================================
   snapshot.js - a "photo of the table" sent to every player.
   We only include what the screens need (no secrets, no timers).
   ============================================================ */

export function snapshot(room, now) {
  return {
    code: room.code,
    hostId: room.hostId,
    phase: room.phase,
    ball: { x: room.ball.x, y: room.ball.y },
    secondsLeft: Math.max(0, Math.ceil((room.phaseEnd - now) / 1000)),
    message: now < room.messageUntil ? room.message : '',
    winnerId: room.winnerId,

    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      seat: p.seat,
      lives: p.lives,
      isBot: p.isBot,
      energy: Math.round(p.energy),
      blowing: p.blowing,
      alive: p.alive,
      connected: p.connected,
      overheated: p.overheatUntil > 0,
    })),
  };
}
