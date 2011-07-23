/*
 *  Lets wrap serializer with some API to change the backed easily
 */

this.MSG_PLAYER_GONE = 1;
this.MSG_PLAYER_POSITION = 2;
this.MSG_NEW_PLAYER = 3;
this.MSG_GONE_PLAYER = 4;
this.MSG_NEW_BULLET = 5;
this.MSG_PING = 6;

var BISON = require('bison');

// script is loaded to the browser
if (typeof window != 'undefined'){
    BISON = window.BISON;
}

this.serialize = function(type, params) {
  var message = {t: type}; //t stands for type
  for (var param in params) {
    if (param != "t") {
      message[param] = params[param];
    };
  };
  // return JSON.stringify(message);
  return BISON.encode(message);
};

this.deserialize = function(data) {
  return BISON.decode(data);
  // return JSON.parse(data);
};