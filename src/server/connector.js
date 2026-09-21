import { parseData } from "../protocol/parser.js";
import handleClientRequest from "../storage/storage.js";

export default function connector(socket) {
  let buffer = "";

  socket.on("data", (data) => {
    buffer += data.toString();

    let messages = buffer.split("\n");

    buffer = messages.pop();

    for (const message of messages) {
      if (!message.trim()) continue;

      const { method, args, time } = parseData(message);

      const response = handleClientRequest(method, args, time);

      socket.write(response + "\n");

      const memoryUsage = process.memoryUsage();
      console.log("memory Usage : ", memoryUsage);
    }
  });
}
