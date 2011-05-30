var Game = function(sock, ser) {
  var GAME_OPTIONS = {w: 640, h:480, color: '#000'};
  var TANK_SIZE = {w: 32, h: 32};
  var ANGLES = {n: 0.0, e: 1.57079633, s: 3.1415926, w: 4.71238898} //north, east, south, west
  var REV_ANGLES = {0.0: 'n', 1.57079633: 'e', 3.1415926: 's', 4.71238898: 'w'}
  this.scene = sjs.Scene(GAME_OPTIONS);
  
  // keep all game objects in arrows
  var players = [];
  var bullets = [];
  
  var socket = sock;
  var background = this.scene.Layer('background', GAME_OPTIONS);
  var bulletLayer = this.scene.Layer('bullets', {w: 640, h:480});
  var ground = this.scene.Sprite('assets/images/ground.png', background);
  ground.setW(window.innerWidth);
  ground.move(0, 160);

  var tank = this.scene.Sprite('assets/images/tank.png', background);
  // var tank = new Tank(this.scene, background);
  tank.size(TANK_SIZE.h, TANK_SIZE.w);
  tank.game = this;
  // TODO: move these methods to tank class------
  tank.canFire = true;
  tank.reset = function() {
    var tx = Math.random() * (GAME_OPTIONS.w - 2 * TANK_SIZE.w) + TANK_SIZE.w;
    var ty = Math.random() * (GAME_OPTIONS.h - 2 * TANK_SIZE.h) + TANK_SIZE.h;
    // console.log("x:" + tx + " y:" + ty);
    tank.position(tx, ty);
    // tank.setAngle(0);
    tank.update();
  };
  tank.allowFire = function(){
    tank.canFire = true;
  }
  tank.shoot = function(){
    var speed_multipl = 1.2;
    var bep = tank.bulletExitPoint();
    var msg = {x: bep[0], y: bep[1]};
    msg.xv = speed_multipl * speed * Math.sin(tank.angle);
    msg.yv = speed_multipl * -speed * Math.cos(tank.angle);
    var b = this.game.addBullet(msg);
    socket.send(ser.serialize(ser.MSG_NEW_BULLET, {x: b.x, y: b.y, xv: b.xv, yv: b.yv}));
  };
  tank.bulletExitPoint = function(){
    var c = this.center();
    var bepX = c[0] + (TANK_SIZE.w/2) * Math.sin(this.angle);
    var bepY = c[1] + (TANK_SIZE.h/2) * - Math.cos(this.angle);
    return [bepX - 2, bepY - 2]; //compensate bullet size
  };
  //----move to tank class---------------------------
  tank.reset();
  
  var input  = new sjs.Input();

  var result = document.getElementById('result');

  // var cycle = new sjs.Cycle([[0, 0, 1]]);
  var speed = 4;
  function paint() {
    
    // -------- HANDLE BULLETS ----------
    for(var i=0; i < bullets.length; i++) {
      var bul = bullets[i];
      bul.applyVelocity();
      bul.update();
      var cwt = bul.collidesWith(tank); // cache expensive operation
      if(bul.x < 0 || bul.y < 0 || bul.x > GAME_OPTIONS.w || bul.y > GAME_OPTIONS.h || bul.collidesWithArray(players) || cwt){
          
          bullets.splice(i, 1);
          bul.remove();
          if (cwt){
            setTimeout(tank.reset, 500); // huh, sometimes tank updates all players with the new coordinates before they detect collision;
          };
          i--;
      };
    };
    // -----------------------------------
    

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

    if(tank.canFire){
      if(input.keyboard.space){
        tank.shoot();
        setTimeout(tank.allowFire, 1000);
        tank.canFire = false;
      };
    };

    // if(input.arrows())
    //     cycle.next(ticker.lastTicksElapsed);
    // else
    //     cycle.reset();

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
  
  // {x : x position, y: y position, xv: x velocity, yv: y velocity}
  this.addBullet = function(msg){
    var speed_multipl = 1.2;
    var b = this.scene.Sprite(null, bulletLayer);
    b.position(msg.x, msg.y);
    b.size(4, 4);
    b.setColor('#fff');
    b.xv = msg.xv;
    b.yv = msg.yv;
    b.update();
    bullets.push(b);
    return b;
  }
  
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
