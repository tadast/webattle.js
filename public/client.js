window.onload = function() {
  var Serializer = require('./serializer');
  var Config = require('./config');
  var host = window.location.origin.replace(/^http/, 'ws');
  var socket = new WebSocket(host);
  var game;

  socket.onopen = function(){
    console.log(">>connected");
    game = new Game(socket, Serializer);
  };
  socket.onmessage = function(message){
    var data = message.data;
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
        case Serializer.MSG_NEW_SHELL:
          game.addShell(msg);
          break;
        case Serializer.MSG_GONE_PLAYER:
          game.removePlayer(msg.i);
          break;
        case Serializer.MSG_RESTART_GAME:
          console.log("restarting game after " + msg.ta + " s.");
            setTimeout(function() {
              game.restart();
            }, msg.ta + 1000);
          break;
        default:
          console.log("unknown message:" + msg);
      }
    }
  };
  socket.onclose = function(){
    console.log("server says: oh, bye");
  };
};
