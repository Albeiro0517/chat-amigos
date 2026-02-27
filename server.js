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

// Socket.IO
io.on("connection", (socket) => {
  console.log("Un usuario se conectó");

  // Escuchar mensajes de chat (texto o imagen)
  socket.on("chat message", (data) => {
    // data.msg puede ser texto o HTML con <img>
    io.emit("chat message", data); // enviar a todos
  });

  socket.on("disconnect", () => {
    console.log("Un usuario se desconectó");
  });
});

// Puerto
const port = process.env.PORT || 3000; // Render asigna el puerto, si no usa 3000
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});