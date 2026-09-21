import config from "./src/config.js";
import server from "./src/server/tcpServer.js";

server.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
