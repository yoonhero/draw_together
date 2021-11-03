const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () =>
  console.log("Server running on Port", PORT)
);
app.use(express.static("public"));

const socket = require("socket.io");
const io = socket(server);

let socketNumber = 0;

const drawQueue = [];

io.on("connect", (socket) => {
  socketNumber++;

  io.emit("socketNumber", socketNumber);

  drawQueue.forEach(([...args]) => socket.emit("drawing", ...args));

  socket.on("clearCanvas", () => {
    drawQueue.length = 0;
    io.emit("clearCanvas");
  });

  socket.on("drawing", (...args) => {
    drawQueue.push([...args]);
    io.emit("drawing", ...args);
  });

  socket.on("disconnect", () => {
    socketNumber--;
    io.emit("socketNumber", socketNumber);
  });
});
