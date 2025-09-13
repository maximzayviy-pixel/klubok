const { Server } = require("socket.io");
const http = require("http");

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res)=>{
  res.writeHead(200, {'Content-Type':'text/plain'});
  res.end('OK');
});

const io = new Server(server, { cors: { origin: "*" } });

const online = new Map();

io.on("connection", (socket) => {
  socket.on("auth", ({ username }) => {
    if (!username) return;
    online.set(username, socket.id);
    io.emit("presence", { user: username, status: "online" });
    socket.data.username = username;
  });

  socket.on("typing", ({ from, to }) => {
    const sid = online.get(to);
    if (sid) io.to(sid).emit("typing", { from });
  });

  socket.on("ringing", ({ from, to }) => {
    const sid = online.get(to);
    if (sid) io.to(sid).emit("ringing", { from });
  });

  socket.on("disconnect", () => {
    const u = socket.data.username;
    if (u) {
      online.delete(u);
      io.emit("presence", { user: u, status: "offline" });
    }
  });
});

server.listen(PORT, ()=> console.log("Realtime server on :" + PORT));
