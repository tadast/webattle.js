<img src="https://github.com/medwezys/webattle.js/raw/master/assets/images/tank24.png">
# webattle.js

## What up

webattle.js is a sample multiplayer game created with Node.js, HTML5 and other related buzzwords.

## Dependencies

* connect - for serving files from server to client (bascially, just index.html for now)
* socket.io - for flawless client-server communication 
* BISON - for efficient serialization
* browserify - for serving same js files for both server and client side
* sprite.js - for rendering graphics

## Trying out

If you already have git, node.js and npm

    git clone https://github.com/medwezys/webattle.js webattle
    cd webattle
    npm install
    
To run you have two options:

    node server.js
    #or
    gem install foreman
    foreman start #uses Procfile

Point your browser to http://localhost:3000. If you have deployed it somewhere, edit ip/url and port in lib/config.js.

If you are just starting to learn and find code too difficult, checkout earlier tags, see changelog below.

## Live Demo

In-progress version is hosted in Joynet's cloud.

[http://uhoh.no.de](http://uhoh.no.de)

## Changelog

0.0.4 Added node_packages folder to git repo for easier deployment to Joynet smart node machine. Shootable bricks. FPS instead of CPU load percentage. Optimize for iPhone screen (No controls for iphone yet). Bugfixes.

0.0.3 Added a Tank class. It uses prototypal inheritance to inherit from Sprite. Tanks now explode on collision with bullet. Issue when remote players were flickering using canvas backend is fixed now.

[]!(https://github.com/medwezys/webattle.js/raw/master/assets/images/tank.png)

0.0.2 Little crappy guys got angry, sat into the tanks and now shoot each other. All logic on the client side which makes easy to cheat (or hurt your pc) editing client side script.

0.0.1 Use proper package management. Thanks Saulius Grigaliunas.

0.0.0 First commit, each connected player gets to control little crappy guy in the screen. All players can see each other crappy little guys!

