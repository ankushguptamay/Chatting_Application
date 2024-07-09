require("dotenv").config();
const express = require("express");
const bodyParser = require('body-parser');
const db = require("./Model");
const cors = require('cors');
const { createServer } = require('node:http');
const yoga = require("./Route/route");
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

db.sequelize.sync()
  .then(() => {
    // console.log("Database synced")
  })
  .catch((error) =>
    console.log(error)
  )
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/api', yoga)
app.get('/', (req, res) => {
  res.send('Hello World!');
});

const onlineUser = [];

io.on('connection', (socket) => {

  // Online User
  socket.on("onlineUser", (userId) => {
    !onlineUser.some((user) => user.userId === userId) &&
      onlineUser.push({
        userId: userId,
        socketId: socket.id
      })
    io.emit("getOnlineUser", { onlineUser: onlineUser });
  });
  // Send Message
  socket.on("send-message", (room, message) => {
    socket.to(room).emit("message-received", message);
  });
  // Join
  socket.on('join-room', (room, userName) => {
    console.log(userName);
    socket.join(room);
  })
  //socket.on('is typing', function(data){
  socket.on('is-typing', (room, userName) => {
    socket.to(room).emit('typing', { userName: userName });
  });
});

PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
