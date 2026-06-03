import type { Server } from "socket.io";

export function registerSockets(io: Server) {
  io.on("connection", (socket) => {
    const restaurantId = String(socket.handshake.auth.restaurantId ?? socket.handshake.query.restaurantId ?? "");
    const role = String(socket.handshake.auth.role ?? socket.handshake.query.role ?? "");
    const tableId = String(socket.handshake.auth.tableId ?? socket.handshake.query.tableId ?? "");

    if (restaurantId) socket.join(`restaurant:${restaurantId}`);
    if (restaurantId && role === "KITCHEN") socket.join(`kitchen:${restaurantId}`);
    if (restaurantId && role === "CASHIER") socket.join(`cashier:${restaurantId}`);
    if (tableId) socket.join(`table:${tableId}`);

    socket.on("table:statusUpdate", (payload) => io.to(`restaurant:${payload.restaurantId}`).emit("table:statusChange", payload));
    socket.on("order:itemReady", (payload) => io.to(`restaurant:${payload.restaurantId}`).emit("order:itemReady", payload));
  });
}
