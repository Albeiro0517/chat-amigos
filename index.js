const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

// Permitir recibir mensajes grandes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Servir archivos estáticos
app.use(express.static(__dirname));

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// -------------------------
// Variables del chat
// -------------------------
let connectedUsers = 0;    // Contador de usuarios conectados
let chatHistory = [];      // Historial de mensajes

// -------------------------
// Socket.IO
// -------------------------
io.on("connection", (socket) => {
  connectedUsers++;
  console.log("Usuario conectado. Total:", connectedUsers);

  // Actualizar contador a todos
  io.emit("updateUsers", connectedUsers);

  // Enviar historial solo al usuario que se conecta
  socket.emit("chat history", chatHistory);

  // Recibir mensajes
  socket.on("chat message", (data) => {
    chatHistory.push(data);        
    io.emit("chat message", data);

    // Enviar notificación a todos los clientes
    io.emit("notification", {
      title: "Nuevo mensaje de " + data.user,
      body: data.msg
    });
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

// Puerto asignado por hosting (Railway/Render) o 3000 local
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});