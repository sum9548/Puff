import { io } from 'socket.io-client';

// In development Vite proxies Socket.IO to the Node server. In production
// the React build and Socket.IO server share the same origin.
export const socket = io({ autoConnect: true });
