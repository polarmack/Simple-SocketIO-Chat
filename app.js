var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path')
const MongoClient = require('mongodb').MongoClient;


const users = [];

function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}


//Connect to Mongodb Atlas
const uri = "mongodb+srv://kunanon1:NP3sxZ0WnG7FZekQ@testcluster.ocoi6.mongodb.net/chat?retryWrites=true&w=majority"
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect( err => {
  if (err) {
    throw err;
  }
  console.log ('MongoDB connected..')
  

  //Connect to Socket.io
  io.on('connection', socket => {

    // Get 20 latest chats from chats collection
    let chat = client.db('chat').collection('chats')
    chat.find().sort({_id:-1}).limit(20).toArray( (err, res) => {
      if(err){
          throw err;
      }
      console.log(res)
      socket.emit('show-latest-message', res.reverse());
    });

    // Hadle input events (chat from type and submit)
    socket.on('send-chat-message', msg => {
      const user = users.filter(user => user.id===socket.id)
      socket.broadcast.emit('chat-message', { message: msg , name: user[0].username })
      
      // keep document of user and chat in chats collection
      chat.insertOne({username:user[0].username , chat:msg})
    });

    // Handle new user
    socket.on('new-user', username => {
      id = socket.id;
      const user = {id, username};
      users.push(user)
      socket.broadcast.emit('user-connected', user)
      socket.broadcast.emit('update-user-online',users)
      socket.emit('update-user-online',users)
      console.log(users)
    });
    
    // Handle Disconnected
    socket.on('disconnect', async () => {
      const user = await userLeave(socket.id) ;
      const name = user.username
      console.log(name, " leaved")
      userLeave(socket.id) ;
      socket.broadcast.emit('user-disconnect', name)
      socket.broadcast.emit('update-user-online',users)
    });
  
    
  });

});

// Use express Static route
app.use(express.static(path.join(__dirname, 'public'))); 

// Listen on port 3000
var port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log('listening on ', port);
});