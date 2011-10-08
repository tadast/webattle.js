var Tank = function(scene, layer, game, id, imageUrl){
  //-- Sprite.js setup --
  this.s = 24;
  this.scene = scene;
  this.layer = layer;
  this.game = game;
  this.setDom();
  
  this.src = imageUrl || 'assets/images/enemy_tank_24.png';
  this.loadImg(this.src);
  this.size(this.s,this.s);
  this.id = id;
  this.speed = game.getOpts().speed;
  this.moved = true; // used for deciding if updating server is needed
  return this;
};

Tank.prototype = new sjs.Sprite();
Tank.prototype.constructor = Tank;

Tank.prototype.hide = function hide(){
  this.size(0,0);
  this.x = -100;
  this.y = -100;
};

// passive does not place the tank in a new position. Used for remote tanks
// that update their position itselves
Tank.prototype.reset = function reset(passive){
  this.size(0,0);
  var tank = this;
  this.x = -100;
  this.y = -100;
  this.moved = true;
  setTimeout(function(){tank._reset(passive)}, 1500);
};

// bit of a dirty hack
// passive does not place the tank in a new position. Used for remote tanks
// that update their position themselves
Tank.prototype._reset = function _reset(passive){
  this.size(this.s,this.s);
  if (!passive) {
    var coords = this.game.mapLoader.randomCoordinateFor(9);
    var compensate = (this.game.mapLoader.squareSize*2-this.w)/2;
    this.position(coords[0]+compensate, coords[1]);
    this.maxScore = Math.max(this.score, (this.maxScore || 0));
    this.score = 25;
    this.updateScreenScore();
    this.update();
  };
  this.moved = true;
  return true;
};

Tank.prototype.canFire = function canFire(){
  var delta = 1000; // ms
  var now = new Date().getTime();
  if(!this.lastShootTime){
    this.lastShootTime = now;
    return true;
  }else if(now-this.lastShootTime > delta){
    this.lastShootTime = now;
    return true;
  }else{
    return false;
  }
}

Tank.prototype.shoot = function(){
  if (!this.canFire()) {
    return false;
  };
  this.score -= 1;
  var speed_multipl = 1.4;
  var bep = this.shellExitPoint();
  var msg = {x: bep[0], y: bep[1]};
  msg.xv = speed_multipl * this.speed * Math.sin(this.angle);
  msg.yv = speed_multipl * -this.speed * Math.cos(this.angle);

  var b = this.game.addShell(msg, true);
  this.updateScreenScore();
  return b;
};

// calculates starting coordinates of shell
// returns array [x, y]
Tank.prototype.shellExitPoint = function(){
  var c = this.center();
  var bepX = c[0] + (this.w/2) * Math.sin(this.angle);
  var bepY = c[1] + (this.h/2) * - Math.cos(this.angle);
  return [bepX - 2, bepY - 2]; //compensate shell size
};

Tank.prototype.onArrowUp = function(){
  this.scale(1, 1);
  this.setAngle(this.game.getAngles().n);
  if (!this.doesColideNorth()){
    this.moveAndMark(0, -this.lagCompensatedSpeed());
  };
};

Tank.prototype.onArrowDown = function(){
  this.scale(-1, 1);
  this.setAngle(this.game.getAngles().s);
  if (!this.doesColideSouth()){
    this.moveAndMark(0, this.lagCompensatedSpeed());
  };
};

Tank.prototype.onArrowRight = function(){
  this.scale(-1, 1);
  this.setAngle(this.game.getAngles().e);
  if (!this.doesColideEast()){
    this.moveAndMark(this.lagCompensatedSpeed(), 0);
  };
};

Tank.prototype.onArrowLeft = function(){
  this.scale(1, 1);
  this.setAngle(this.game.getAngles().w);
  if (!this.doesColideWest()){
    this.moveAndMark(-this.lagCompensatedSpeed(), 0);
  };
};

// colisions with game world 
Tank.prototype.doesColideWest = function(){
  if((this.x - this.lagCompensatedSpeed()) <= 0.0){
    return true;
  };
  return false;
};

Tank.prototype.doesColideEast = function(){
  if((this.x + this.w) >= this.game.getOpts().w){
    return true;
  };
  return false;
};

Tank.prototype.doesColideNorth = function(){
  // with game world
  if((this.y - this.lagCompensatedSpeed()) <= 0.0){
    return true;
  };
  return false;
};

Tank.prototype.doesColideSouth = function(){
  if((this.y + this.h) >= this.game.getOpts().h){
    return true;
  };
  return false;
};

// override draw method when canvas is on. For fun
Tank.prototype.canvasUpdate = function updateCanvas (layer) {
    if(layer)
        var ctx = layer.ctx;
    else
        var ctx = this.layer.ctx;
    ctx.save();
    ctx.translate(this.x + this.w/2 | 0, this.y + this.h/2 | 0);
    ctx.rotate(this.angle);
    if(this.xscale != 1 || this.yscale != 1)
        ctx.scale(this.xscale, this.yscale);
    ctx.globalAlpha = this.opacity;
    ctx.translate(-this.w/2 | 0, -this.h/2 | 0);
    // handle background colors.
    if(this.color) {
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, this.w, this.h);
    }
    // handle repeating images, a way to implement repeating background in canvas

    ctx.fillStyle = "#B06F00";
    ctx.fillRect(this.xoffset, this.yoffset + 2, this.w, this.h - 4);

    ctx.fillStyle = "#FFD182";
    ctx.fillRect(this.xoffset + (this.w/2) -2, this.yoffset-3, 4, this.h/2);
    
    ctx.fillStyle = "#5C3A00";
    ctx.fillRect(this.xoffset, this.yoffset, 7, this.h);
    ctx.fillRect(this.xoffset + this.w -7, this.yoffset, 7, this.h);
    
    ctx.restore();
    return this;
};

Tank.prototype.moveAndMark = function moveAndMark(x, y){
  this.moved = true;
  this.move(x, y);
};

Tank.prototype.lagCompensatedSpeed = function getLagCompensatedSpeed(){
  return this.game.getOpts().speed * this.game.getLagMultiplyer();
};

Tank.prototype.giveScoresForHit = function giveScoresForHit(){
  this.score += 20;
  this.updateScreenScore();
}

Tank.prototype.updateScreenScore = function updateScreenScore(){
  document.getElementById('score').innerHTML = this.score;
  document.getElementById('max_score').innerHTML = (this.maxScore || "");
};