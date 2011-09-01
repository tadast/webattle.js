var Shell = function(scene, layer, game){
  this.scene = scene;
  this.layer = layer;
  this.game = game;
  this.setDom();
  
  this.size(4, 4);
  this.setColor('#fff');
  return this;
};

Shell.prototype = new sjs.Sprite();
Shell.prototype.constructor = Shell;

Shell.prototype.paramsFromMessage = function paramsFromMessage(msg){
  this.xv = msg.xv;
  this.yv = msg.yv;
  this.position(msg.x, msg.y);
  this.tankId = msg.tankId;
};

Shell.prototype.belongsToLocalPlayer = function belongsToLocalPlayer(){
  return this.tankId === undefined;
};