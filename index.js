// -------------------------
// index.js - Inspiring-Flow
// -------------------------
const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// -------------------------
// Middleware
// -------------------------
app.use(express.static(__dirname));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// -------------------------
// Rutas
// -------------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// -------------------------
// Variables del chat
// -------------------------
let connectedUsers = 0;
let chatHistory = [];

// -------------------------
// Socket.IO
// -------------------------
io.on("connection", (socket) => {
  connectedUsers++;
  console.log("Usuario conectado. Total:", connectedUsers);

  // Actualizar contador a todos
  io.emit("updateUsers", connectedUsers);

  // Enviar historial solo al nuevo usuario
  socket.emit("chat history", chatHistory);

  // Recibir mensaje
  socket.on("chat message", (data) => {
    chatHistory.push(data);
    io.emit("chat message", data);

    // Notificación en consola (puedes reemplazar por push si agregas service worker)
    console.log("Mensaje recibido:", data);
  });

  // Vaciar chat
  socket.on("clear chat", () => {
    chatHistory = [];
    io.emit("chat cleared");
  });

  // Usuario desconectado
  socket.on("disconnect", () => {
    connectedUsers = Math.max(connectedUsers - 1, 0);
    console.log("Usuario desconectado. Total:", connectedUsers);
    io.emit("updateUsers", connectedUsers);
  });
});

// -------------------------
// Puerto
// -------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Inspiring-Flow corriendo en puerto ${PORT}`);
});