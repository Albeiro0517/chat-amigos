const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// Para poder recibir imágenes, permitimos objetos JSON grandes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Servir archivos estáticos (index.html, icon.png, sw.js, manifest.json)
app.use(express.static(__dirname));

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Contador de usuarios conectados
let connectedUsers = 0;

// Socket.IO
io.on("connection", (socket) => {
  connectedUsers++; // aumenta al conectarse
  console.log("Un usuario se conectó. Total:", connectedUsers);
  
  // Enviar a todos la cantidad de usuarios conectados
  io.emit("updateUsers", connectedUsers);

  // Escuchar mensajes de chat (texto o imagen)
  socket.on("chat message", (data) => {
    io.emit("chat message", data); // enviar a todos
  });

  socket.on("disconnect", () => {
    connectedUsers--; // disminuye al desconectarse
    console.log("Un usuario se desconectó. Total:", connectedUsers);
    io.emit("updateUsers", connectedUsers);
  });
});

// Puerto
const port = process.env.PORT || 3000; // Render asigna el puerto
http.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});