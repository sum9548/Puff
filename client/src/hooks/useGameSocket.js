import { useCallback, useEffect, useState } from 'react';
import { socket } from '../socket/client.js';

export function useGameSocket() {
  const [connected, setConnected] = useState(socket.connected);
  const [game, setGame] = useState(null);
  const [myId, setMyId] = useState(socket.id ?? null);
  const [inRoom, setInRoom] = useState(false);
  const [blowing, setBlowing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (socket.connected) { setConnected(true); setMyId(socket.id); }
    const onConnect = () => { setConnected(true); setMyId(socket.id); };
    const onDisconnect = () => { setConnected(false); setBlowing(false); };
    const onState = (snapshot) => setGame(snapshot);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('state', onState);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('state', onState);
    };
  }, []);

  const createRoom = useCallback((name) => {
    setError('');
    socket.emit('createRoom', { name }, (result) => {
      if (result?.ok) { setInRoom(true); setGame(null); }
      else setError(result?.error || 'Could not create a room. Please try again.');
    });
  }, []);

  const joinRoom = useCallback((name, code) => {
    setError('');
    socket.emit('joinRoom', { name, code: code.toUpperCase() }, (result) => {
      if (result?.ok) { setInRoom(true); setGame(null); }
      else setError(result?.error || 'Could not join that room.');
    });
  }, []);

  const leaveRoom = useCallback(() => {
    socket.emit('blow', false);
    socket.emit('leaveRoom');
    setInRoom(false); setGame(null); setBlowing(false); setError('');
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const setBlow = useCallback((value) => {
    setBlowing(value);
    if (inRoom) socket.emit('blow', value);
  }, [inRoom]);

  return { connected, game, myId, inRoom, blowing, error, setError, createRoom, joinRoom, leaveRoom, setBlow };
}
