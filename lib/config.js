if(process.env === undefined){
  process.env = {};
}
this.port = process.env.PORT || 5000;
this.ip = process.env.HOST || "localhost";
