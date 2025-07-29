// src/socket.js
import { io } from "socket.io-client";

const socket = io({
  path: "/socket.io",
  transports: ["websocket", "polling"], // fallback desteði
});

export default socket;
