import { parseData } from "../protocol/parser.js";
import handleClientRequest from "../storage/storage.js";

export default function connector(socket) {
  socket.on("data", (data) => {
    const { method, args, time } = parseData(data.toString());

    const response = handleClientRequest(method, args, time);

    socket.write(response + "\n");
  });
}
