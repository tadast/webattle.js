var __lastId = 0;
var nextId = function(){
  __lastId += 1;
  return __lastId;
};

var Player = exports = module.exports =  function(sessionId){
  this.initialize(sessionId);
}

Player.prototype.initialize = function(sid) {
  this.sid = sid;
  this.id = nextId();
};

exports.Player = Player;