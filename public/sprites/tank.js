var Tank = function(scene, background, game){
  this.scene = scene;
  this.layer = background;
  this.game = game;
  this.src = 'assets/images/tank.png';
  this.setDom();
  this.loadImg(this.src);
  return this;
};

Tank.prototype = new sjs.Sprite();
Tank.prototype.constructor = Tank;