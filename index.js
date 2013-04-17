
/**
 * Module dependencies.
 */

var user = require('./routes/user');
var express = require('express');
var routes = require('./routes');
var https = require('https');
var http = require('http');
var path = require('path');
var fs = require('fs');
var app = express();

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
var httpServer = http.createServer(app.handle.bind(app)).listen(7171);
var httpIo = require('socket.io').listen(httpServer);

httpIo.sockets.on('connection', function(socket){  
  socket.on('connect', function(){
    console.log('   ---> WS Connected (server message)');  
    socket.emit('established',"{Websocket: connection established}");	
  });
  socket.on('reconnect',function(){    
    console.log('   ---> WS Reconnected (server message)');
    socket.emit('restablished',"{Websocket: connection restablished}");	
  });
  socket.on('send', function(message){
    console.log('   ---> Sending a message (server message)');
    httpIo.sockets.send(message);	
  });
  socket.on('disconnect',function(){
    console.log('   ---> WS Disconnected (server message)');
    socket.emit('disconnected', "{Websocket: disconnected}");
    //httpServer.close();
  });
});


/*WSS Connection..............................
..............................................*/

var httpsServer = https.createServer(options,app.handle.bind(app)).listen(7272);
var httpsIo = require('socket.io').listen(httpsServer,{transports:['flashsocket', 'websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']});

httpsIo.sockets.on('connection', function(socket){
  socket.on('connect', function(){
    console.log('   ---> WSS Connected (server message)');
    socket.emit('established', "{Websocket secure: connection established}");
  });
  socket.on('reconnect',function(){
    console.log('   ---> WSS Reconnected (server message)');
    socket.emit('restablished',"{Websocket secure: connection restablished}");
  });
  socket.on('send', function(message){
    httpsIo.sockets.send(message);
  });
  socket.on('disconnect',function(){
    console.log('   ---> WSS Disconnected (server message)');
    socket.emit('disconnected', "{Websocket secure: disconnected}");
    //httpsServer.close();
  });
});
