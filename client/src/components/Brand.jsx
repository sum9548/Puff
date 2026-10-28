import React from 'react';

export default function Brand({ compact = false }) {
  return <div className="flex items-center gap-3">
    <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-puff-purple shadow-[0_8px_30px_rgba(169,155,255,.3)]">
      <span className="h-4 w-4 rounded-full bg-[#19152c] shadow-[inset_-3px_-3px_0_rgba(255,255,255,.12)]" />
      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#10111b] bg-puff-mint" />
    </div>
    <div><div className="font-display text-3xl font-extrabold leading-none tracking-tight">Puff<span className="text-puff-purple">.</span></div>{!compact && <div className="mt-1 text-[10px] font-bold uppercase tracking-[.22em] text-white/40">Multiplayer mayhem</div>}</div>
  </div>;
}
