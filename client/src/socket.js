// src/socket.js
import { io } from "socket.io-client";

const hostname = window.location.hostname;
const isSecure = window.location.protocol === "https:";
const protocol = isSecure ? "wss" : "ws";

const socket = io(`${protocol}://${hostname}`, {
  transports: ["websocket"],
  path: "/socket.io",
});

export default socket; // ? default export
