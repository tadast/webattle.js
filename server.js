var connect = require('connect');
var io = require('socket.io');
var Serializer = require('./lib/serializer.js');
var Config = require('./lib/config.js');
var Player = new require('./lib/player.js');

var server = connect.createServer();
server.use(connect.static(__dirname));
server.use(require('browserify')({
    require: ['bison', __dirname + '/lib/serializer', __dirname + '/lib/config'],
    mount : '/browserify.js',
}));
server.listen(Config.port);

var players = [];
var socket = io.listen(server);

socket.on('connection', function(client){
  addPlayer(client);
  sendPing(client);
  initializeRestart();
  
  client.on('message', function(data){
    var msg = Serializer.deserialize(data);
    // TODO: check if valid before sending data to clients
    if (msg.t) {
      switch (msg.t) {
        case Serializer.MSG_PLAYER_POSITION:
          msg["i"] = getPlayerId(client.sessionId);
          client.broadcast(Serializer.serialize(msg.t, msg));
          break;
        case Serializer.MSG_NEW_SHELL:
          msg.tankId = getPlayerId(client.sessionId);
          client.broadcast(Serializer.serialize(msg.t, msg));
          break;
        case Serializer.MSG_PING:
          var now = Date.now();
          console.log("Ping[" + getPlayerId(client.sessionId) + "]: " + (now - msg.time) + "ms");
          sendPing(client);
          break;
        default:
          console.log("unknown message:" + msg);
      };
    };
  });
  
  client.on('disconnect',function(){
    console.log('Client disconnected');
    removePlayer(client.sessionId);
  });
});

// removes player id so server does not send it for new players
var removePlayer = function(sid){
  var msg = Serializer.serialize(Serializer.MSG_GONE_PLAYER, {i: getPlayerId(sid)});
  socket.broadcast(msg);
  for (var i=0; i < players.length; i++) {
    if(players[i].sid == sid){
      players.splice(i, 1);
      break;
    };
  };
  console.log(players.length + " players left");
};

// let new player know about existing players
// TODO: not efficient, send in one message
var introduceExistingSprites = function(client){
  for (var x=0; x < players.length; x++) {
    var sp = Serializer.serialize(Serializer.MSG_NEW_PLAYER, {i: players[x].id});
    client.send(sp);
  };
}

var getPlayerBySid = function(sid){
  for (var i=0; i < players.length; i++) {
    if(players[i].sid == sid){
      return players[i];
      break;
    };
  };
  console.log("Player does not exist!" + sid);
  return null;
}

// return "internal" player id given client's sessionId
var getPlayerId = function(sid){
  var player = getPlayerBySid(sid);
  if (player) {
    return player.id;
  };
  return NaN;
}

var addPlayer = function(client){
  // notify everyone about new player, pass player id
  var p = new Player(client.sessionId);
  var pser = Serializer.serialize(Serializer.MSG_NEW_PLAYER, {i: p.id});
  // notify everyone except new player
  socket.broadcast(pser, client.sessionId);
  // notify new player about existing game objects and positions
  introduceExistingSprites(client);
  players.push(p);
  console.log("Player added " + p.id);
};

var sendPing = function(client) {
  setTimeout(function() {
    var timestamp = String(Date.now());
    client.send(Serializer.serialize(Serializer.MSG_PING, {time: timestamp}));
  }, 3000);
};

var initializeRestart = function(){
  var after = 1;
  // if (players.length > 2) {
  //   after = 30;
  // };
  var msg = Serializer.serialize(Serializer.MSG_RESTART_GAME, {ta: after});
  socket.broadcast(msg);
}

console.log('Server is running on http://'+Config.ip+':'+Config.port);
