import net from "net";
import connector from "./connector.js";

const server = new net.createServer();

server.on("connection", (socket) => {
  console.log("Client connected");
  connector(socket);
});

server.on("error", (error) => {
  console.error("Socket error:", error.message);
});

server.on("close", () => {
  console.log("Server closed");
});

export default server;
