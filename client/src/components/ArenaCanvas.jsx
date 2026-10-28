import React, { useEffect, useRef } from 'react';

const COLORS = ['#a99bff', '#74f0c0', '#ff927b', '#ffc56e'];
const SIZE = 600;

export default function ArenaCanvas({ game, myId, onBlow }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(game);
  const myIdRef = useRef(myId);
  useEffect(() => { gameRef.current = game; }, [game]);
  useEffect(() => { myIdRef.current = myId; }, [myId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame;
    let size = 560;
    let dpr = window.devicePixelRatio || 1;
    let ball = { x: 300, y: 300 };
    let trail = [];

    const resize = () => {
      const parentWidth = canvas.parentElement?.clientWidth || 320;
      size = Math.max(260, Math.min(parentWidth, window.innerHeight - 330, 560));
      dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      canvas.width = Math.floor(size * dpr);
      canvas.height = Math.floor(size * dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const roundedRect = (x, y, w, h, r) => {
      ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
    };
    const draw = (time) => {
      frame = requestAnimationFrame(draw);
      const gameNow = gameRef.current;
      if (!gameNow || !['playing', 'countdown', 'pause', 'ended'].includes(gameNow.phase)) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      const me = gameNow.players.find((p) => p.id === myIdRef.current);
      const turn = me ? (2 - me.seat + 4) % 4 : 0;
      const scale = (size * dpr) / SIZE;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
      gradient.addColorStop(0, '#22243a'); gradient.addColorStop(1, '#151625');
      ctx.fillStyle = gradient; roundedRect(0, 0, SIZE, SIZE, 28); ctx.fill();
      ctx.save(); roundedRect(0, 0, SIZE, SIZE, 28); ctx.clip();
      ctx.translate(300, 300); ctx.rotate(turn * Math.PI / 2); ctx.translate(-300, -300);
      ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 2;
      for (let i = 100; i < SIZE; i += 100) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SIZE, i); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(300, 300, 72, 0, Math.PI * 2); ctx.stroke();

      for (let seat = 0; seat < 4; seat++) {
        const player = gameNow.players.find((p) => p.seat === seat);
        ctx.save(); ctx.translate(300, 300); ctx.rotate(seat * Math.PI / 2); ctx.translate(-300, -300);
        if (player?.alive) {
          if (player.blowing && !player.overheated) {
            ctx.fillStyle = COLORS[seat] + '20'; ctx.beginPath(); ctx.moveTo(180, 28); ctx.lineTo(420, 28); ctx.lineTo(300, 300); ctx.closePath(); ctx.fill();
            for (let i = 0; i < 6; i++) {
              const y = 45 + ((time / 5 + i * 29) % 125);
              ctx.strokeStyle = COLORS[seat]; ctx.globalAlpha = Math.max(0, 1 - (y - 45) / 125) * .8;
              ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(210 + i * 32, y); ctx.lineTo(210 + i * 32, y + 16); ctx.stroke();
            }
            ctx.globalAlpha = 1;
          }
          ctx.fillStyle = player.overheated ? '#5c5d70' : COLORS[seat];
          roundedRect(170, -8, 260, 38, 12); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 3;
          for (let x = 205; x <= 395; x += 30) { ctx.beginPath(); ctx.moveTo(x, 6); ctx.lineTo(x, 20); ctx.stroke(); }
        } else {
          ctx.fillStyle = '#55566b'; roundedRect(20, -6, 560, 14, 6); ctx.fill();
        }
        ctx.restore();
      }

      if (gameNow.ball) {
        ball.x += (gameNow.ball.x - ball.x) * .45; ball.y += (gameNow.ball.y - ball.y) * .45;
        trail.push({ ...ball }); if (trail.length > 8) trail.shift();
        trail.forEach((point, index) => { ctx.globalAlpha = (index / trail.length) * .2; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(point.x, point.y, 20 * index / trail.length, 0, Math.PI * 2); ctx.fill(); });
        ctx.globalAlpha = 1; ctx.fillStyle = '#f8f7ff'; ctx.beginPath(); ctx.arc(ball.x, ball.y, 22, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#c8c2ff'; ctx.beginPath(); ctx.arc(ball.x - 7, ball.y - 7, 5, 0, Math.PI * 2); ctx.fill();
      }
      if (me?.alive) { ctx.fillStyle = COLORS[me.seat]; ctx.font = '800 16px DM Sans, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('YOU', 300, 566); }
      ctx.restore();
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);

  const holdStart = (event) => { event.preventDefault(); onBlow(true); };
  const holdEnd = () => onBlow(false);
  return <canvas ref={canvasRef} aria-label="Puff game arena" className="touch-none rounded-[28px]" onPointerDown={holdStart} onPointerUp={holdEnd} onPointerCancel={holdEnd} onLostPointerCapture={holdEnd} onContextMenu={(e) => e.preventDefault()} />;
}
