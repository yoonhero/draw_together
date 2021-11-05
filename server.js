const express = require("express");
const app = express();
const http = require("http");

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

app.use(express.static("public"));

const { Server } = require("socket.io");
const io = new Server(server);

let socketNumber = {};

const drawQueue = {};

io.on("connection", (socket) => {
  console.log("new user connected");

  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    drawQueue[roomName].forEach(([...args]) =>
      socket.to(roomName).emit("drawing", ...args)
    );
    socketNumber[roomName]++;
    io.to(roomName).emit("socketNumber", socketNumber[roomName]);
  });

  socket.on("clearCanvas", (roomName) => {
    drawQueue[roomName].length = 0;
    io.to(roomName).emit("clearCanvas");
  });

  socket.on("drawing", (roomName, drawColor, lineWidth, lastPos, xyPos) => {
    drawQueue[roomName].push([drawColor, lineWidth, lastPos, xyPos]);
    io.to(roomName).emit("drawing", [drawColor, lineWidth, lastPos, xyPos]);
  });

  socket.on("disconnect", (roomName) => {
    socketNumber[roomName]--;
    io.to(roomName).emit("socketNumber", socketNumber[roomName]);
  });
});

server.listen(PORT, () => {
  console.log("Start Server 🚀");
});
