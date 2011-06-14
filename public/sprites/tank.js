var Tank = function(scene, background, game){
  //-- Sprite.js setup --
  this.s = 24;
  this.scene = scene;
  this.layer = background;
  this.src = 'assets/images/tank24.png';
  this.setDom();
  this.loadImg(this.src);
  this.size(this.s,this.s);
  //-- Custom logic --
  this.speed = game.getOpts().speed;
  this.game = game;
  return this;
};

Tank.prototype = new sjs.Sprite();
Tank.prototype.constructor = Tank;

// passive does not place the tank in a new position. Used for remote tanks
// that update their position itselves
Tank.prototype.reset = function reset(passive){
  this.size(0,0);
  var tank = this;
  setTimeout(function(){tank._reset(passive)}, 1500);
};

// bit of a dirty hack
// passive does not place the tank in a new position. Used for remote tanks
// that update their position themselves
Tank.prototype._reset = function _reset(passive){
  this.size(this.s,this.s);
  if (!passive) {
    var tx = 200;//Math.random() * (this.game.getOpts().w - 2 * this.w) + this.w;
    var ty = 400;//Math.random() * (this.game.getOpts().h - 2 * this.h) + this.h;
    this.position(tx, ty);
    this.update();
  };
  return true;
};

Tank.prototype.canFire = function canFire(){
  var delta = 500; // ms
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
  var speed_multipl = 1.2;
  var bep = this.bulletExitPoint();
  var msg = {x: bep[0], y: bep[1]};
  msg.xv = speed_multipl * this.speed * Math.sin(this.angle);
  msg.yv = speed_multipl * -this.speed * Math.cos(this.angle);
  var b = this.game.addBullet(msg, true);
  
  return b;
};

// calculates starting coordinates of bullet
// returns array [x, y]
Tank.prototype.bulletExitPoint = function(){
  var c = this.center();
  var bepX = c[0] + (this.w/2) * Math.sin(this.angle);
  var bepY = c[1] + (this.h/2) * - Math.cos(this.angle);
  return [bepX - 2, bepY - 2]; //compensate bullet size
};
