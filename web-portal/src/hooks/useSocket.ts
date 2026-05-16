// hooks/useSocket.ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

let socketInstance: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (!socketInstance || !socketInstance.connected) {
      socketInstance = io(`${WS_URL}/calls`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socketInstance.on('connect', () => setIsConnected(true));
      socketInstance.on('disconnect', () => setIsConnected(false));
      socketInstance.on('connection:success', () => setIsConnected(true));
    }

    setSocket(socketInstance);

    return () => {
      // Don't disconnect on unmount — keep singleton
    };
  }, []);

  return { socket, isConnected };
}
