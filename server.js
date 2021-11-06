const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
// app.use(express.static("public"));
const httpServer = http.createServer(app);

let serverOptions = {
  cors: true,
  origins: ["http://127.0.0.1:4000"],
};

const io = new Server(httpServer, serverOptions);

let socketNumber = {};

const drawQueue = {};

io.on("connection", (socket) => {
  console.log("new user connected");

  // socket.on("hello", (data, data2, data3) => {
  //   console.log(data, data2, data3);

  //   io.emit("metoo", "what's up?");
  // });

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

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`Start Server on localhost:${PORT} 🚀`);
});
