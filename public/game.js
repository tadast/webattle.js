var Game = function(sock, ser) {
  this.mapLoader = new MapLoader(defaultMap);
  
  var GAMEOPTS = {
    w: this.mapLoader.widthInPixels(), 
    h: this.mapLoader.heightInPixels(), 
    color: '#000', 
    speed: 3
  };
  this.getOpts = function getOpts(){
    return GAMEOPTS;
  };
  var ANGLES = {n: 0.0, e: 1.57079633, s: 3.1415926, w: 4.71238898} //north, east, south, west
  var REV_ANGLES = {0.0: 'n', 1.57079633: 'e', 3.1415926: 's', 4.71238898: 'w'}
  this.scene = sjs.Scene(GAMEOPTS);
  
  var socket = sock;
  var staticOpts = GAMEOPTS;
  staticOpts['autoClear'] = false;
  var staticLayer = this.scene.Layer('staticLayer', staticOpts );
  var dynamicLayer = this.scene.Layer('dynamicLayer', {w: GAMEOPTS.w, h: GAMEOPTS.h});

  // keep all game objects in spritelists
  var debris = sjs.SpriteList([]); 
  var players = sjs.SpriteList([]);
  var bullets = sjs.SpriteList([]);
  var bricks = this.mapLoader.getSpritelistFor(this.scene, staticLayer, 1);
  
  var tank = new Tank(this.scene, dynamicLayer, this);
  tank.reset();
  
  var input  = new sjs.Input();

  var result = document.getElementById('result');

  var bricksDrawn = false; // we only need to draw bricks once, as staticLayer is set to not autoclear;
  var tankState = {x: tank.x, y: tank.y};
  // var cycle = new sjs.Cycle([[0, 0, 1]]);
  function paint() {
    
    // -------- HANDLE BULLETS ----------
    var bul;
    while(bul = bullets.iterate()) {
      bul.applyVelocity();
      bul.update();
      if(bul.x < 0 || bul.y < 0 || bul.x > GAMEOPTS.w || bul.y > GAMEOPTS.h || bul.collidesWithArray(bricks)){
          bullets.remove(bul);
          // bul.remove();
      };
      if(bul.collidesWith(tank)){
        bullets.remove(bul);
        explosion(tank);
        tank.reset();
      };
      var collidePlayer;
      if(collidePlayer = bul.collidesWithArray(players)){
        bullets.remove(bul);
        explosion(collidePlayer);
        collidePlayer.reset(true);
      };
    };
    // -------- HANDLE EXPLOSION DEBRIS ---
    var debri;
    while(debri = debris.iterate()) {
        debri.applyVelocity();
        if(debri.rv < 0.001) {
        //if(false){
            debris.remove(debri);
            //debri.remove();
        } else {
            debri.update();
        }
        debri.xv *= 0.95;
        debri.yv *= 0.95;
        debri.rv *= 0.95;
    }
    
    // canvas backend clears screen automatically, so all players are cleaned as well
    // therefore we need to draw them to each frame. It is not true for html backend
    if (staticLayer.useCanvas) {
      var x;
      while(x = players.iterate()){
        x.update();
      }
      if(!bricksDrawn){ // we only draw it once
        while(x = bricks.iterate()){
          x.update();
        }
        bricksDrawn = true;
      }
    };
    
    if(input.keyboard.left) {
      tank.scale(1, 1);
      tank.setAngle(ANGLES.w);
      if (!doesColideWest()){
        tank.move(-GAMEOPTS.speed, 0);
      };
    }else if(input.keyboard.right) {
      tank.scale(-1, 1);
      tank.setAngle(ANGLES.e);
      if (!doesColideEast()){
        tank.move(GAMEOPTS.speed, 0);
      };
    }else if(input.keyboard.up) {
      tank.scale(1, 1);
      tank.setAngle(ANGLES.n);
      if (!doesColideNorth()){
        tank.move(0, -GAMEOPTS.speed);
      };
    }else if(input.keyboard.down) {
      tank.scale(-1, 1);
      tank.setAngle(ANGLES.s);
      if (!doesColideSouth()){
        tank.move(0, GAMEOPTS.speed);
      };
    };
    
    if (tank.collidesWithArray(bricks)){
      if (tank.x == tankState.x && tank.y == tankState.y){ //TODO: fix collision detection to work without this hack
        tank.move(0, GAMEOPTS.speed);
      } else {
        //reset previous state
        tank.position(tankState.x, tankState.y);
      }
    } else {
      tankState = {x: tank.x, y: tank.y};
    };
    if(input.keyboard.space){
      tank.shoot();
    };

    tank.update();

    if(ticker.currentTick % 30 == 0) {
        result.innerHTML = ' ' + ticker.load + '%';
    }
    socket.send(ser.serialize(ser.MSG_PLAYER_POSITION, {x: tank.x, y: tank.y, a: REV_ANGLES[tank.angle]}));
  };
  
  // TODO: move to tank object
  var doesColideWest = function(){
    // with game world
    if((tank.x - GAMEOPTS.speed) <= 0.0){
      return true;
    };
    return false;
  };
  var doesColideEast = function(){
    if((tank.x + tank.w) >= GAMEOPTS.w){
      return true;
    };
    return false;
  };
  var doesColideNorth = function(){
    // with game world
    if((tank.y - GAMEOPTS.speed) <= 0.0){
      return true;
    };
    return false;
  };
  var doesColideSouth = function(){
    if((tank.y + tank.h) >= GAMEOPTS.h){
      return true;
    };
    return false;
  };
  
  // creates a cloud of debris and adds randov velocities to each particle
  // adds all debris to the list. Does nothing to original sprite (i.e. removal of it
  // has to be done out of this function)
  var explosion = function explosion(sprite){
    if(Math.random() > 0.5) {
      var x = 1 + Math.random() * sprite.w-1 | 0;
      var y = 1 + Math.random() * sprite.h-1 | 0;
      var _debris = sprite.explode4(x, y, dynamicLayer);
    } else {
      var horizontal = Math.random() > 0.5;
      var position = 1 + Math.random() * sprite.w-1 | 0;
      var _debris = sprite.explode2(position, horizontal, dynamicLayer);
    }
    for (var j=0; j < _debris.length; j++) {
      var part = _debris[j];
      part.xv = 7 * (Math.random() - 0.5)
      part.yv = 7 * (Math.random() - 0.5)
      part.rv = Math.random() / 2;
      part.applyVelocity();
    }
    debris.add(_debris);
  }
  // msg: {x : x position, y: y position, xv: x velocity, yv: y velocity}
  // send: optional parameter. If true then other players will receive info about bullet.
  // send is only used for locally created bullets
  this.addBullet = function(msg, send){
    var speed_multipl = 1.2;
    var b = this.scene.Sprite(null, dynamicLayer);
    b.position(msg.x, msg.y);
    b.size(4, 4);
    b.setColor('#fff');
    b.xv = msg.xv;
    b.yv = msg.yv;
    b.update();
    bullets.add(b);
    if (send){
      socket.send(ser.serialize(ser.MSG_NEW_BULLET, {x: b.x, y: b.y, xv: b.xv, yv: b.yv}));
    };
    return b;
  };
  
  this.createPlayer = function(id){
    var tmpPlayer = new Tank(this.scene, dynamicLayer, this);
    tmpPlayer.id = id; //ugh, adding id property to sprite illegaly
    players.add(tmpPlayer);
    tmpPlayer.reset(true);
    // console.log("I haz " + players.length + " playerz now");
  };
  
  // msg is a hash of {i: id, x: x, y: y}
  this.updatePlayer = function(msg){
    var player;
    while (player = players.iterate()) {
      if(msg.i == player.id){
        player.setX(msg.x)
        player.setY(msg.y);
        player.setAngle(ANGLES[msg.a]);
        player.update();
      };
    };
  };
  
  this.removePlayer = function(id){
    var player;
    while (player = players.iterate()) {
    if(player.id == id){
      //player.remove();
      players.remove(player);
      break;
    };
    // console.log("I haz " + players.lenght + " players now");
  };
  };
  var ticker = this.scene.Ticker(35, paint);
  ticker.run();
};
