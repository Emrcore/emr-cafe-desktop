// src/socket.js
import { io } from "socket.io-client";

const baseUrl = window.electronAPI?.getServerUrl?.() || window.location.origin;
const socket = io(baseUrl.replace(/\/+$/, ""), {
  path: "/socket.io",
  transports: ["websocket"],
  withCredentials: true,
});

// Hem default hem named export saðlayalým
export default socket;
export { socket };
