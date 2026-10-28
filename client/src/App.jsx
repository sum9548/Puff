import React, { useCallback, useEffect, useMemo, useState } from "react";
import Brand from "./components/Brand.jsx";
import ArenaCanvas from "./components/ArenaCanvas.jsx";
import { useGameSocket } from "./hooks/useGameSocket.js";
import { socket } from "./socket/client.js";

const SEAT_COLORS = ["#a99bff", "#74f0c0", "#ff927b", "#ffc56e"];

function PlayerBadge({ player, me }) {
  return (
    <div
      className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 ${me ? "border-puff-purple/40 bg-puff-purple/10" : "border-white/10 bg-black/10"} ${!player.alive ? "opacity-40" : ""}`}
    >
      <span
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ background: SEAT_COLORS[player.seat] }}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">
          {player.name}
          {me ? " (you)" : ""}
        </div>
        <div
          className="mt-1 flex gap-1"
          aria-label={`${player.lives} lives remaining`}
        >
          {[0, 1, 2].map((life) => (
            <span
              key={life}
              className={`h-1.5 w-4 rounded-full ${life < player.lives ? "bg-puff-mint" : "bg-white/15"}`}
            />
          ))}
        </div>
      </div>
      {player.isBot && (
        <span className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white/50">
          Bot
        </span>
      )}
      {player.overheated && (
        <span className="text-xs font-bold text-orange-300">Hot</span>
      )}
    </div>
  );
}

function Home({ createRoom, joinRoom, error, setError, connected }) {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem("puff-name") || "";
    } catch {
      return "";
    }
  });
  const [code, setCode] = useState(
    () =>
      new URLSearchParams(window.location.search)
        .get("room")
        ?.toUpperCase()
        .slice(0, 4) || "",
  );
  const saveName = () => {
    const safeName = name.trim().slice(0, 12) || "Player";
    try {
      localStorage.setItem("puff-name", safeName);
    } catch {}
    return safeName;
  };
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-10 sm:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
        <section className="text-center lg:text-left">
          <div className="mb-8 inline-flex rounded-full border border-puff-mint/20 bg-puff-mint/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em] text-puff-mint">
            A tiny game. Big chaos.
          </div>
          <div className="mx-auto mb-5 flex justify-center lg:mx-0 lg:justify-start">
            <Brand />
          </div>
          <h1 className="font-display text-5xl font-extrabold leading-[.98] tracking-tight sm:text-7xl">
            One ball.
            <br />
            <span className="text-puff-purple">Four fans.</span>
            <br />
            Zero mercy.
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-white/55 sm:text-lg lg:mx-0">
            Push the ball away from your edge, manage your fan energy, and stay
            alive longer than everyone else.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-white/55 lg:justify-start">
            <span className="rounded-xl border border-white/10 px-3 py-2">
              ✦ 2–4 players
            </span>
            <span className="rounded-xl border border-white/10 px-3 py-2">
              ✦ Play with bots
            </span>
            <span className="rounded-xl border border-white/10 px-3 py-2">
              ✦ No downloads
            </span>
          </div>
        </section>
        <section className="panel mx-auto w-full max-w-md p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="eyebrow">Jump into the arena</p>
              <h2 className="mt-1 font-display text-3xl font-extrabold">
                Ready, player?
              </h2>
            </div>
            <span
              className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-puff-mint shadow-[0_0_15px_#74f0c0]" : "bg-orange-300"}`}
              title={connected ? "Connected" : "Connecting"}
            />
          </div>
          <label
            htmlFor="player-name"
            className="mb-2 block text-sm font-bold text-white/75"
          >
            Your nickname
          </label>
          <input
            id="player-name"
            className="field mb-4"
            maxLength={12}
            placeholder="e.g. BreezeBoss"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createRoom(saveName())}
          />
          <button
            className="btn btn-primary w-full py-4"
            disabled={!connected}
            onClick={() => createRoom(saveName())}
          >
            Create a room <span className="ml-2">↗</span>
          </button>
          <div className="my-5 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[.2em] text-white/30">
            <span className="h-px flex-1 bg-white/10" />
            or join a friend
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <div className="flex gap-2">
            <input
              aria-label="Room code"
              className="field min-w-0 text-center font-extrabold uppercase tracking-[.35em]"
              maxLength={4}
              placeholder="CODE"
              value={code}
              onChange={(e) => {
                setCode(
                  e.target.value.replace(/[^a-z0-9]/gi, "").toUpperCase(),
                );
                setError("");
              }}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                code.length === 4 &&
                joinRoom(saveName(), code)
              }
            />
            <button
              className="btn shrink-0"
              disabled={!connected || code.trim().length !== 4}
              onClick={() => joinRoom(saveName(), code)}
            >
              Join room
            </button>
          </div>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-200"
            >
              {error}
            </p>
          )}
          <p className="mt-5 text-center text-xs leading-5 text-white/35">
            Room host? Add bots to fill empty seats and practice solo.
          </p>
        </section>
      </div>
    </main>
  );
}

function Lobby({ game, myId, leaveRoom }) {
  const [copied, setCopied] = useState(false);
  const host = game.hostId === myId;
  const inviteLink = `${window.location.origin}/?room=${game.code}`;
  const copyLink = async () => {
    try {
      // First, try the browser's clipboard API.
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      // Fallback for browsers that block clipboard access.
      const textArea = document.createElement("textarea");

      textArea.value = inviteLink;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const copied = document.execCommand("copy");
      textArea.remove();

      if (!copied) {
        window.prompt("Copy your invite link:", inviteLink);
        return;
      }
    }

    // Update the button after a successful copy.
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Brand compact />
        <button className="btn" onClick={leaveRoom}>
          Leave room
        </button>
      </div>
      <div className="grid gap-5 md:grid-cols-[.85fr_1.15fr]">
        <section className="panel flex flex-col items-center justify-center p-7 text-center sm:p-9">
          <p className="eyebrow">Your room code</p>
          <div className="my-3 font-display text-6xl font-extrabold tracking-[.2em] text-puff-purple">
            {game.code}
          </div>
          <p className="mb-6 max-w-xs text-sm leading-6 text-white/45">
            Send this code to your friends. The arena is better with rivals.
          </p>
          <button className="btn w-full" onClick={copyLink}>
            {copied ? "✓ Invite link copied" : "↗ Copy invite link"}
          </button>
          <div className="mt-6 w-full rounded-2xl bg-black/20 p-4 text-left">
            <p className="text-xs font-extrabold uppercase tracking-widest text-white/40">
              Quick rules
            </p>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Hold to blow the ball away. If it hits your edge, lose a life.
              Watch your energy—overheat and you’re helpless for a moment.
            </p>
          </div>
        </section>
        <section className="panel p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="eyebrow">The lineup</p>
              <h2 className="font-display text-3xl font-extrabold">
                Players{" "}
                <span className="text-white/35">{game.players.length}/4</span>
              </h2>
            </div>
            <span className="rounded-full bg-puff-mint/10 px-3 py-1.5 text-xs font-bold text-puff-mint">
              Waiting room
            </span>
          </div>
          <div className="space-y-2">
            {game.players
              .slice()
              .sort((a, b) => a.seat - b.seat)
              .map((player) => (
                <PlayerBadge
                  key={player.id}
                  player={player}
                  me={player.id === myId}
                />
              ))}
            {Array.from({ length: Math.max(0, 4 - game.players.length) }).map(
              (_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex items-center gap-3 rounded-2xl border border-dashed border-white/10 px-3 py-4 text-sm text-white/30"
                >
                  <span className="h-3 w-3 rounded-full border border-white/20" />
                  Waiting for a player…
                </div>
              ),
            )}
          </div>
          {host ? (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                className="btn"
                disabled={game.players.length >= 4}
                onClick={() => socket.emit("addBot")}
              >
                + Add a bot
              </button>
              <button
                className="btn"
                disabled={!game.players.some((p) => p.isBot)}
                onClick={() => socket.emit("removeBot")}
              >
                − Remove bot
              </button>
            </div>
          ) : (
            <p className="mt-5 text-center text-sm text-white/40">
              Waiting for the host to start the game…
            </p>
          )}
          {host && (
            <>
              <button
                className="btn btn-primary mt-3 w-full py-4"
                disabled={game.players.length < 2}
                onClick={() => socket.emit("startGame")}
              >
                Start game <span className="ml-2">→</span>
              </button>
              {game.players.length < 2 && (
                <p className="mt-2 text-center text-xs text-white/35">
                  Add a bot or invite at least one friend.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function Game({ game, myId, blowing, setBlow, leaveRoom }) {
  const me = game.players.find((p) => p.id === myId);
  const winner = game.players.find((p) => p.id === game.winnerId);
  const isHost = game.hostId === myId;
  const buttonLabel = !me?.alive
    ? "You are out — spectate"
    : me?.overheated
      ? "Fan cooling down…"
      : blowing
        ? "Blowing… keep holding!"
        : "Hold to blow";
  useEffect(() => {
    const down = (e) => {
      if (
        e.code === "Space" &&
        !e.repeat &&
        game.phase === "playing" &&
        me?.alive
      ) {
        e.preventDefault();
        setBlow(true);
      }
    };
    const up = (e) => {
      if (e.code === "Space") setBlow(false);
    };
    const blur = () => setBlow(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [game.phase, me?.alive, setBlow]);
  useEffect(() => {
    if (game.phase !== "playing" || !me?.alive) setBlow(false);
  }, [game.phase, me?.alive, setBlow]);
  const hold = (value) => {
    if (me?.alive && !me?.overheated && game.phase === "playing")
      setBlow(value);
  };
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-5 sm:px-8 sm:py-8">
      <header className="mb-5 flex items-center justify-between gap-3">
        <Brand compact />
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/50">
            ROOM <b className="ml-1 tracking-widest text-white">{game.code}</b>
          </div>
          <button className="btn px-3 py-2 text-sm" onClick={leaveRoom}>
            Leave
          </button>
        </div>
      </header>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {game.players
          .slice()
          .sort((a, b) => a.seat - b.seat)
          .map((p) => (
            <PlayerBadge key={p.id} player={p} me={p.id === myId} />
          ))}
      </div>
      <section className="panel relative flex flex-col items-center overflow-hidden p-3 sm:p-5">
        <div className="mb-3 flex w-full items-center justify-between px-2">
          <span className="eyebrow">Survive the gust</span>
          <span className="text-xs font-bold text-white/40">
            {game.phase === "playing" ? "LIVE MATCH" : game.phase.toUpperCase()}
          </span>
        </div>
        <div className="relative flex w-full justify-center">
          <ArenaCanvas game={game} myId={myId} onBlow={hold} />
          {(game.phase === "countdown" || game.phase === "pause") && (
            <div className="absolute inset-0 grid place-items-center rounded-[28px] bg-black/40 backdrop-blur-sm">
              <div className="text-center">
                <div className="font-display text-8xl font-extrabold text-white drop-shadow-lg">
                  {game.phase === "countdown"
                    ? game.secondsLeft || 1
                    : "Breathe"}
                </div>
                <p className="font-bold text-white/60">
                  {game.phase === "countdown"
                    ? "Get ready!"
                    : game.message || "Resetting the ball…"}
                </p>
              </div>
            </div>
          )}
          {game.message && game.phase === "playing" && (
            <div className="absolute top-4 rounded-full border border-white/10 bg-[#10111b]/85 px-4 py-2 text-sm font-bold shadow-lg">
              {game.message}
            </div>
          )}
          {game.phase === "ended" && (
            <div className="absolute inset-0 grid place-items-center rounded-[28px] bg-[#10111b]/80 p-5 backdrop-blur-md">
              <div className="max-w-sm text-center">
                <div className="mb-2 text-4xl">
                  {winner?.id === myId ? "🏆" : "💨"}
                </div>
                <p className="eyebrow">Match complete</p>
                <h2 className="mt-2 font-display text-5xl font-extrabold">
                  {!winner
                    ? "No winner"
                    : winner.id === myId
                      ? "You win!"
                      : `${winner.name} wins!`}
                </h2>
                <p className="mt-3 text-sm text-white/55">
                  {winner?.id === myId
                    ? "Your edge stayed safe. Beautifully played."
                    : winner
                      ? "Their edge stayed safe the longest."
                      : "Everyone ran out of lives."}
                </p>
                {isHost ? (
                  <button
                    className="btn btn-primary mt-6 w-full"
                    onClick={() => socket.emit("playAgain")}
                  >
                    Play again ↻
                  </button>
                ) : (
                  <p className="mt-5 text-sm text-white/40">
                    Waiting for the host to start another round.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 w-full max-w-[560px]">
          <button
            className={`w-full rounded-2xl px-5 py-4 text-base font-extrabold transition active:scale-[.99] ${blowing ? "bg-puff-mint text-[#10251f] shadow-[0_0_30px_rgba(116,240,192,.2)]" : me?.overheated ? "bg-orange-200/20 text-orange-100" : !me?.alive ? "bg-white/10 text-white/40" : "bg-puff-purple text-[#171326] hover:bg-[#b9adff]"}`}
            disabled={!me?.alive || me?.overheated || game.phase !== "playing"}
            onPointerDown={(e) => {
              e.preventDefault();
              hold(true);
            }}
            onPointerUp={() => hold(false)}
            onPointerCancel={() => hold(false)}
            onPointerLeave={() => hold(false)}
          >
            {buttonLabel}
          </button>
          <div className="mt-4 flex items-center justify-between text-xs font-bold text-white/45">
            <span>FAN ENERGY</span>
            <span
              className={me?.energy < 25 ? "text-orange-200" : "text-puff-mint"}
            >
              {me?.overheated ? "OVERHEATED" : `${me?.energy ?? 100}%`}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-[width] duration-150 ${me?.energy < 25 ? "bg-orange-300" : "bg-puff-mint"}`}
              style={{ width: `${me?.energy ?? 100}%` }}
            />
          </div>
          <p className="mt-3 text-center text-xs text-white/30">
            Hold the button or space bar to blow · Release to recharge
          </p>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const gameSocket = useGameSocket();
  const {
    connected,
    game,
    myId,
    inRoom,
    blowing,
    error,
    setError,
    createRoom,
    joinRoom,
    leaveRoom,
    setBlow,
  } = gameSocket;
  useEffect(() => {
    if (inRoom && game?.phase === "lobby") return;
    if (inRoom && game && game.phase !== "lobby") return;
  }, [inRoom, game]);
  const handleLeave = useCallback(() => leaveRoom(), [leaveRoom]);
  const screen = !inRoom
    ? "home"
    : !game || game.phase === "lobby"
      ? "lobby"
      : "game";
  return (
    <div className="flex min-h-screen flex-col text-white">
      {!connected && (
        <div className="sticky top-0 z-50 bg-orange-300 px-4 py-2 text-center text-xs font-extrabold text-[#261b10]">
          Connection lost · reconnecting to the arena…
        </div>
      )}
      {screen === "home" && (
        <Home
          createRoom={createRoom}
          joinRoom={joinRoom}
          error={error}
          setError={setError}
          connected={connected}
        />
      )}
      {screen === "lobby" && game && (
        <Lobby game={game} myId={myId} leaveRoom={handleLeave} />
      )}
      {screen === "lobby" && !game && (
        <div className="flex flex-1 items-center justify-center text-sm text-white/50">
          Connecting to your room…
        </div>
      )}
      {screen === "game" && game && (
        <Game
          game={game}
          myId={myId}
          blowing={blowing}
          setBlow={setBlow}
          leaveRoom={handleLeave}
        />
      )}
      <footer className="px-5 pb-5 pt-2 text-center text-[10px] font-bold uppercase tracking-[.2em] text-white/20">
        Puff · push your luck
      </footer>
    </div>
  );
}
