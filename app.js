var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path')

function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

app.use(express.static(path.join(__dirname, 'public'))); 

const users = [];

io.on('connection', socket => {
  socket.on('send-chat-message', msg => {
    const user = users.filter(user => user.id===socket.id)
    socket.broadcast.emit('broadcast-chat-message', { message: msg , name: user[0].username })
 });

 socket.on('new-user', username => {
  id = socket.id;
  const user = {id, username};
  users.push(user)
  socket.broadcast.emit('user-connected', user)
  socket.broadcast.emit('update-user-online',users)
  socket.emit('update-user-online',users)
  console.log(users)
});

  socket.on('disconnect', async () => {
    const user = userLeave(socket.id) ;
    console.log(user)
    const name = user.username
    console.log(name)
    userLeave(socket.id) ;
    socket.broadcast.emit('user-disconnect', name)
    socket.broadcast.emit('update-user-online',users)
  });

  
});

var port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log('listening on ', port);
});