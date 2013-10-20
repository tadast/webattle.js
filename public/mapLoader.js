var MapLoader = function MapLoader(mapHash){
  this.squareSize = mapHash.squareSize; // size of one map cell in pixels
  this.map = mapHash.map;
  this.mapHash = mapHash;
  this.coords = new Object();
};

MapLoader.prototype.constructor = MapLoader;

MapLoader.prototype.widthInPixels = function(){
  return this.map[0].length * this.squareSize;
};

MapLoader.prototype.heightInPixels = function(){
  return this.map.length * this.squareSize;
};

// this should probably evolve to create lists for all sprites at once
MapLoader.prototype.getSpritelistFor = function(scene, layer, spriteId){
  var list = sjs.SpriteList([]);
  for(var i=0; i < this.map.length; i++){
    var row = this.map[i];
    for (var j=0; j < row.length; j++) {
      if(row[j] == spriteId){
        var sprite = scene.Sprite(this.mapHash.images[spriteId], layer);
        sprite.size(this.squareSize, this.squareSize);
        var x = this.toPixel(j);
        var y = this.toPixel(i);
        sprite.position(x, y);
        sprite.loadImg(sprite.src);
        sprite.update();
        list.add(sprite);
      }
    }
  }
  return list;
};

//returns array of [x,y] coordinates for given identifier in the map
MapLoader.prototype.getCoordinatesFor = function(id) {
  if (this.coords[id] !== undefined){ //cache
    return this.coords[id];
  }
  this.coords[id] = [];
  for(var i=0; i < this.map.length; i++){
    var row = this.map[i];
    for (var j=0; j < row.length; j++) {
      if(row[j] == id){
        this.coords[id].push(this.toPixels(j, i));
      }
    }
  }
  return this.coords[id];
};

MapLoader.prototype.randomCoordinateFor = function(id) {
  var c = this.getCoordinatesFor(id);
  return c[Math.round(Math.random()*(c.length-1))];
};

MapLoader.prototype.toPixels = function(i, j) {
  return [this.toPixel(i), this.toPixel(j)];
};

MapLoader.prototype.toPixel = function(n) {
  return n * this.squareSize;
};
