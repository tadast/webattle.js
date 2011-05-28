var Game = function(sock, ser) {
  var players = [];
  this.scene = sjs.Scene()
  
  var stopped = false;
  var socket = sock;
  var background = this.scene.Layer('background');
  var ground = this.scene.Sprite('assets/images/ground.png', background);
  ground.setW(window.innerWidth / 2);
  ground.move(0, 160);

  var rock1 = this.scene.Sprite('assets/images/rock.png', background);
  rock1.move(150, 140);
  var rock2 = this.scene.Sprite('assets/images/rock.png', background);
  rock2.move(350, 140);

  var sprite = this.scene.Sprite('assets/images/character.png');
  sprite.move(50, 80);
  sprite.size(21, 51);

  var cycle = new sjs.Cycle([[4, 3, 2],
                             [34, 3, 3],
                             [64, 3, 3],
                             [94, 3, 3],
                             [124, 3, 3],
                             [154, 3, 3],
                             [184, 3, 3]]);
  cycle.sprites = [sprite];

  var input  = new sjs.Input();

  var yv = 0, result = document.getElementById('result');

  function paint() {
      var xv = 0;
      // gravity
      yv += 0.3;
      var collision = ground.collidesWith(sprite);

      if(input.keyboard.left) {
          sprite.move(-4, 0);
          if(sprite.collidesWith([rock1, rock2]))
              sprite.move(4, 0);
          sprite.scale(1, 1);
      }
      if(input.keyboard.right) {
          sprite.move(4, 0);
          if(sprite.collidesWith([rock1, rock2]))
              sprite.move(-4, 0);
          sprite.scale(-1, 1);
      }


      if(sprite.collidesWithArray([rock1, rock2, ground])) {
          yv = 0;
          if(input.keyboard.up) {
              yv = -5;
              sprite.move(0, yv);
          }
      } else {
          sprite.move(0, yv);
      }

      if(input.arrows())
          cycle.next(ticker.lastTicksElapsed);
      else
          cycle.reset();

      sprite.update();
      
      // this shoudn't be necessary if nothing changed with canvas
      rock2.update();
      rock1.update();
      ground.update();
      
      if(ticker.currentTick % 30 == 0) {
          result.innerHTML = ' ' + ticker.load + '%';
      }
      socket.send(ser.serialize(ser.MSG_PLAYER_POSITION, {x: sprite.x, y: sprite.y}));
  };
  
  this.createPlayer = function(id){
    var tmpPlayer = this.scene.Sprite('assets/images/character.png');
    tmpPlayer.move(50, 80);
    tmpPlayer.size(21, 51);
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
