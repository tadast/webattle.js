var MapLoader = function MapLoader(mapHash){
  this.squareSize = mapHash.squareSize; // size of one map cell in pixels
  this.map = mapHash.map;
  this.mapHash = mapHash;
};

MapLoader.prototype.constructor = MapLoader;
  
MapLoader.prototype.widthInPixels = function(){
  return this.map[0].length * this.squareSize;
};
  
MapLoader.prototype.heightInPixels = function(){
  return this.map.length * this.squareSize;
};

// this should probably evolve to create lists for all sprites ar once
MapLoader.prototype.getSpritelistFor = function(scene, layer, spriteId){
  var list = sjs.SpriteList([]);
  for(var i=0; i < this.map.length; i++){
    var row = this.map[i];
    for (var j=0; j < row.length; j++) {
      if(row[j] == spriteId){
        var sprite = scene.Sprite(this.mapHash.images[spriteId], layer);
        sprite.size(this.squareSize, this.squareSize);
        var x = j * this.squareSize;
        var y = i * this.squareSize;
        sprite.position(x, y);
        sprite.loadImg(sprite.src);
        sprite.update();
        list.add(sprite);
      };
    };
  };
  return list;
};