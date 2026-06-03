"use client";

import { io } from "socket.io-client";

export function connectSocket(auth: Record<string, string>) {
  return io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000", {
    auth,
    transports: ["websocket"]
  });
}
