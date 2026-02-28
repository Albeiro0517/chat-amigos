// sw.js
// Instalación del Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker instalado");
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker activo");
  clients.claim();
});

// Escuchar mensajes push (notificaciones)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "Chat Amigos", body: "Nuevo mensaje!" };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon.png", // Opcional: icono de tu chat
    })
  );
});

// Opcional: abrir chat al hacer click en la notificación
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/");
    })
  );
});