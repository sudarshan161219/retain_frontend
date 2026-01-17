import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
export const getSocket = () => {
  const url = import.meta.env.VITE_API_BASE_URL;
  if (!socket) {
    const URL = url || "http://localhost:8080";
    socket = io(URL, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
};
