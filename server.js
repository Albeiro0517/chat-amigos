const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// Permitir recibir imágenes grandes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Servir archivos estáticos
app.use(express.static(__dirname));

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
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
  connectedUsers++; // Nuevo usuario
  console.log("Usuario conectado. Total:", connectedUsers);

  // Enviar contador actualizado a todos
  io.emit("updateUsers", connectedUsers);

  // Enviar historial al usuario que se conecta
  socket.emit("chat history", chatHistory);

  // Escuchar mensajes
  socket.on("chat message", (data) => {
    chatHistory.push(data);        // Guardar mensaje
    io.emit("chat message", data); // Enviar a todos
  });

  // Vaciar chat
  socket.on("clear chat", () => {
    chatHistory = [];
    io.emit("chat cleared");
  });

  // Usuario se desconecta
  socket.on("disconnect", () => {
    connectedUsers--; // Restar al contador
    console.log("Usuario desconectado. Total:", connectedUsers);
    io.emit("updateUsers", connectedUsers);
  });
});

// Puerto dinámico para Render
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});