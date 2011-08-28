var Game = function(sock, ser) {
  this.mapLoader = new MapLoader(coolMap);
  
  var GAMEOPTS = {
    w: this.mapLoader.widthInPixels(), 
    h: this.mapLoader.heightInPixels(), 
    color: '#000', 
    speed: 2
  };
  var ANGLES = {n: 0.0, e: 1.57079633, s: 3.1415926, w: 4.71238898}; //north, east, south, west
  var REV_ANGLES = {0.0: 'n', 1.57079633: 'e', 3.1415926: 's', 4.71238898: 'w'};
  var lagMultiplyer = 1.0;
  
  this.getOpts = function(){
    return GAMEOPTS;
  };
  
  this.getAngles = function(){
    return ANGLES;
  };
  
  this.getLagMultiplyer = function(){
    return Math.max(1, lagMultiplyer);
  };
  
  this.scene = sjs.Scene(GAMEOPTS);
  
  var socket = sock;
  var staticOpts = GAMEOPTS;
  var staticLayer = this.scene.Layer('staticLayer', staticOpts );
  var dynamicLayer = this.scene.Layer('dynamicLayer', {w: GAMEOPTS.w, h: GAMEOPTS.h});

  var debris = sjs.SpriteList([]); 
  var players = sjs.SpriteList([]);
  var shells = sjs.SpriteList([]);
  var bricks = this.mapLoader.getSpritelistFor(this.scene, staticLayer, 1);
  
  var tank = new Tank(this.scene, dynamicLayer, this, -1, 'assets/images/tank24.png');
  
  var input  = new sjs.Input();

  var result = document.getElementById('result');

  var tankState = {x: tank.x, y: tank.y};
  // var cycle = new sjs.Cycle([[0, 0, 1]]);
  var lastScene = Date.now();
  function paint() {
    
    // -------- HANDLE shells ----------
    var shell;
    while(shell = shells.iterate()) {
      shell.applyVelocity(lagMultiplyer);
      shell.update();
      var brick = shell.collidesWithArray(bricks);
      if(shell.x < 0 || shell.y < 0 || shell.x > GAMEOPTS.w || shell.y > GAMEOPTS.h || brick){
          shells.remove(shell);
          shell.remove();
          if (brick) {
            bricks.remove(brick);
            brick.remove();
          };
      };
      if(shell.collidesWith(tank) && shell.tankId !== undefined){
        shells.remove(shell);
        shell.remove();
        explosion(tank);
        tank.reset();
      };
      var collidePlayer;
      if(collidePlayer = shell.collidesWithArray(players)){
        if (collidePlayer.id != shell.tankId) { // collision with self shell can occur due to network quirks
          shells.remove(shell);
          shell.remove();
          explosion(collidePlayer);
          collidePlayer.reset(true);
        };
      };
    };
    // -------- HANDLE EXPLOSION DEBRIS ---
    var debri;
    while(debri = debris.iterate()) {
        debri.applyVelocity();
        if(debri.rv < 0.001) {
            debris.remove(debri);
            debri.remove();
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
      while(x = bricks.iterate()){
        x.update();
      }
    };
    
    if(input.keyboard.left) {
      tank.onArrowLeft();
    }else if(input.keyboard.right) {
      tank.onArrowRight();
    }else if(input.keyboard.up) {
      tank.onArrowUp();
    }else if(input.keyboard.down) {
      tank.onArrowDown();
    };
    
    if (tank.collidesWithArray(bricks)){
      if (tank.x == tankState.x && tank.y == tankState.y){ //TODO: fix collision detection to work without this hack
        tank.move(0, GAMEOPTS.speed);
      } else {
        tank.position(tankState.x, tankState.y);
      }
    } else {
      tankState = {x: tank.x, y: tank.y};
    };
    
    if(input.keyboard.space || input.mousedown){
      tank.shoot();
    };

    tank.update();

    // if(ticker.currentTick % 30 == 0) {
    //     result.innerHTML = ticker.fps;
    // }
    socket.send(ser.serialize(ser.MSG_PLAYER_POSITION, {x: tank.x, y: tank.y, a: REV_ANGLES[tank.angle]}));
    
    var now = Date.now();
    lagMultiplyer = (now - lastScene) / 25.0;
    lastScene = now;
  };
  
  
  function restart(){
    cleanList(debris);
    cleanList(shells);
    cleanList(bricks);
    bricks = this.mapLoader.getSpritelistFor(this.scene, staticLayer, 1);
    tank.reset();
  };
  
  this.restart = restart;
  
  var cleanList = function(list){
    while(x = list.iterate()){
      x.remove();
    };
    list = sjs.SpriteList([]);
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
  // send: optional parameter. If true then other players will receive info about shell.
  // send is only used for locally created shells
  this.addShell = function(msg, send){
    var shell = new Shell(this.scene, dynamicLayer, this);
    shell.paramsFromMessage(msg);
    shells.add(shell);
    if (send){
      socket.send(ser.serialize(ser.MSG_NEW_SHELL, {x: shell.x, y: shell.y, xv: shell.xv, yv: shell.yv}));
    };
    return shell;
  };
  
  this.createPlayer = function(id){
    var tmpPlayer = new Tank(this.scene, dynamicLayer, this, id);
    players.add(tmpPlayer);
    tmpPlayer.reset(true);
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
        players.remove(player);
        player.remove();
        break;
      };
    };
  };
  var ticker = this.scene.Ticker(35, paint);
  ticker.run();
};
