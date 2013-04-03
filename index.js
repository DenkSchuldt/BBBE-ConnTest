
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var https = require('https');
var http = require('http');
var path = require('path');
var app = express();
var fs = require('fs');

var options = {
  key: fs.readFileSync('./authentication/server.key'),
  cert: fs.readFileSync('./authentication/server.crt'),
  requestCert: true,
  rejectUnauthorized: false
};

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);


/*WS Connection...............................
..............................................*/
var httpServer = http.createServer(app.handle.bind(app)).listen(8080);
var httpIo = require('socket.io').listen(httpServer);

httpIo.sockets.on('connection', function(socket){
  socket.emit('newsWS',"{Websocket: connection established}");
  console.log("   ---> WS Connected :::");
  socket.on('connect', function(){});
  socket.on('message', function(data){});
  socket.on('disconnect',function(){
    console.log("   ---> WS Disconnected :::");
    httpServer.close();
  });
});


/*WSS Connection..............................
..............................................*/
var httpsServer = https.createServer(options,app.handle.bind(app)).listen(9090);
var httpsIo = require('socket.io').listen(httpsServer);

httpsIo.sockets.on('connection', function(socket){
  socket.emit('newsWSS',"{Websocket secure: connection established}");
  console.log("   ---> WSS Connected :::");
  socket.on('connect', function(){});
  socket.on('message', function(data){});
  socket.on('disconnect',function(){
    console.log("   ---> WSS Disconnected :::");
    httpsServer.close();
  });
});

