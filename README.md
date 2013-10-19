<img src="https://github.com/medwezys/webattle.js/raw/master/assets/images/tank24.png">
# webattle.js

webattle.js is a sample multiplayer game created with Node.js, HTML5 and other related buzzwords.
It also works in iOS browsers: swipe to move, tap to fire!

## Dependencies

* connect - for serving files from server to client (bascially, just index.html for now)
* ws - for server side sockets
* BISON - for efficient serialization
* browserify - for serving same js files for both server and client side
* sprite.js - for rendering graphics

## Trying out

If you already have git, node.js and npm

    git clone git@github.com:tadast/webattle.js.git webattle
    cd webattle
    npm install

To run you have two options:

    node server.js
    #or
    gem install foreman
    foreman start #uses Procfile

Point your browser to http://localhost:5000. If you have deployed it somewhere, edit ip/url and port in lib/config.js.

If you are just starting to learn and find code too difficult, checkout earlier tags, see changelog below.

## Live Demo

[http://webattle.herokuapp.com](http://webattle.herokuapp.com) - renders using HTML sprites

[http://webattle.herokuapp.com/?canvas=1](http://webattle.herokuapp.com/?canvas=1) - renders using canvas sprites

## Deploying on Heroku

https://devcenter.heroku.com/articles/heroku-labs-websockets

## Changelog

0.0.5 Replaced socket.io with raw sockets and ws. Heroku-compatible

0.0.4 Added node_packages folder to git repo for easier deployment to Joynet smart node machine. Shootable bricks. FPS instead of CPU load percentage. Optimize for iPhone screen (No controls for iphone yet). Bugfixes.

0.0.3 Added a Tank class. It uses prototypal inheritance to inherit from Sprite. Tanks now explode on collision with shell. Issue when remote players were flickering using canvas backend is fixed now.

0.0.2 Little crappy guys got angry, sat into the tanks and now shoot each other. All logic on the client side which makes easy to cheat (or hurt your pc) editing client side script.

0.0.1 Use proper package management. Thanks Saulius Grigaliunas.

0.0.0 First commit, each connected player gets to control little crappy guy in the screen. All players can see each other crappy little guys!

