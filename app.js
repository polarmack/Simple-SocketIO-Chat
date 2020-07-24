var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path')

app.use(express.static(path.join(__dirname, 'public'))); 

const users = {}

io.on('connection', (socket) => {
  socket.on('send-chat-message', msg => {
    socket.broadcast.emit('broadcast-chat-message', { message: msg , name: users[socket.id] })
 });

 socket.on('new-user', name => {
  users[socket.id] = name
  socket.broadcast.emit('user-connected', name)
});

  socket.on('disconnect', () => {
      socket.broadcast.emit('user-disconnect', users[socket.id])
      delete users[socket.id]
  });

  
});

var port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log('listening on ', port);
});