window.onload = function() {
  var Serializer = require('./serializer');
  var Config = require('./config');
  var socket = new io.Socket(Config.ip,{
    port: Config.port
  });
  var game;
  
  socket.connect();
  socket.on('connect', function(){
    console.log(">>connected");
    game = new Game(socket, Serializer);
  }); 
  socket.on('message', function(data){
    var msg = Serializer.deserialize(data);
    if (msg.t) {
      switch (msg.t) {
        case Serializer.MSG_NEW_PLAYER:
          game.createPlayer(msg.i);
          break;
        case Serializer.MSG_PING:
          socket.send(data);
          break;
        case Serializer.MSG_PLAYER_POSITION:
          game.updatePlayer(msg);
          break;
        case Serializer.MSG_NEW_BULLET:
          game.addBullet(msg);
          break;
        case Serializer.MSG_GONE_PLAYER:
          game.removePlayer(msg.i);
          break;
        default:
          console.log("unknown message:" + msg);
      };
    };
  });
  socket.on('disconnect', function(){
    console.log("server says: oh, bye");
  });
};