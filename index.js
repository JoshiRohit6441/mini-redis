import server from "./src/server/tcpServer.js";

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
