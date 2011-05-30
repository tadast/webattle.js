var Game = function(sock, ser) {
  var GAME_OPTIONS = {w: 640, h:480, color: '#333'};
  var TANK_SIZE = {w: 32, h: 32};
  var ANGLES = {n: 0.0, e: 1.57079633, s: 3.1415926, w: 4.71238898} //north, east, south, west
  var REV_ANGLES = {0.0: 'n', 1.57079633: 'e', 3.1415926: 's', 4.71238898: 'w'}
  this.scene = sjs.Scene(GAME_OPTIONS);
  
  var players = [];
  var socket = sock;
  var background = this.scene.Layer('background', GAME_OPTIONS);
  var ground = this.scene.Sprite('assets/images/ground.png', background);
  ground.setW(window.innerWidth);
  ground.move(0, 160);

  var tank = this.scene.Sprite('assets/images/tank.png', background);
  tank.size(TANK_SIZE.h, TANK_SIZE.w);
  tank.reset = function() {
    tank.x = Math.random() * (GAME_OPTIONS.w - 2 * TANK_SIZE.w) + TANK_SIZE.w;
    tank.y = Math.random() * (GAME_OPTIONS.h - 2 * TANK_SIZE.h) + TANK_SIZE.h;
    tank.setAngle(0);
    tank.update();
  };
  tank.reset();
  
  var input  = new sjs.Input();

  var result = document.getElementById('result');

  var cycle = new sjs.Cycle([[0, 0, 1]]);
  var speed = 4;
  function paint() {
    if(input.keyboard.left) {
      if (!doesColideWest()){
        tank.move(-speed, 0);
      };
      tank.scale(1, 1);
      tank.setAngle(ANGLES.w);
    }else if(input.keyboard.right) {
      if (!doesColideEast()){
        tank.move(speed, 0);
      };
      tank.scale(-1, 1);
      tank.setAngle(ANGLES.e);
    }else if(input.keyboard.up) {
      if (!doesColideNorth()){
        tank.move(0, -speed);
      };
      tank.scale(1, 1);
      tank.setAngle(ANGLES.n);
    }else if(input.keyboard.down) {
      if (!doesColideSouth()){
        tank.move(0, speed);
      };
      tank.scale(-1, 1);
      tank.setAngle(ANGLES.s);
    }

    if(input.keyboard.space){
      console.log("x:"+tank.x+" y:"+tank.y);
    };
    
    if(input.arrows())
        cycle.next(ticker.lastTicksElapsed);
    else
        cycle.reset();

    tank.update();
    
    if(ticker.currentTick % 30 == 0) {
        result.innerHTML = ' ' + ticker.load + '%';
    }
    socket.send(ser.serialize(ser.MSG_PLAYER_POSITION, {x: tank.x, y: tank.y, a: REV_ANGLES[tank.angle]}));
  };
  
  // TODO: move to tank object
  var doesColideWest = function(){
    // with game world
    if((tank.x - speed) <= 0.0){
      return true;
    };
    return false;
  };
  var doesColideEast = function(){
    if((tank.x + tank.w) >= GAME_OPTIONS.w){
      return true;
    };
    return false;
  };
  var doesColideNorth = function(){
    // with game world
    if((tank.y - speed) <= 0.0){
      return true;
    };
    return false;
  };
  var doesColideSouth = function(){
    if((tank.y + tank.h) >= GAME_OPTIONS.h){
      return true;
    };
    return false;
  };
  
  this.createPlayer = function(id){
    var tmpPlayer = this.scene.Sprite('assets/images/tank.png', background);
    tmpPlayer.move(50, 80);
    tmpPlayer.size(30, 30);
    tmpPlayer.id = id; //ugh, adding id property to sprite illegaly
    players.push(tmpPlayer);
    tmpPlayer.update();
    console.log("I haz " + players.length + " playerz now");
  };
  
  // msg is a hash of {i: id, x: x, y: y}
  this.updatePlayer = function(msg){
    for (var i=0; i < players.length; i++) {
      if(msg.i == players[i].id){
        players[i].setX(msg.x)
        players[i].setY(msg.y);
        players[i].setAngle(ANGLES[msg.a]);
        players[i].update();
      }
    };
  };
  
  this.removePlayer = function(id){
    for (var i=0; i < players.length; i++) {
    if(players[i].id == id){
      players[i].remove();
      players.splice(i, 1);
      break;
    };
    console.log("I haz " + players.lenght + " players now");
  };
  };
  var ticker = this.scene.Ticker(35, paint);
  ticker.run();
};
