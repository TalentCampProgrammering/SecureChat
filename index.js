var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

var io = require('socket.io').listen(server);;

server.listen(7777);

var people = {};

io.sockets.on('connection', function (client) {
  client.on('join', function(name) {
  	people[client.id] = name;
  	client.emit('update', "You have connected to the server.");
  	io.sockets.emit('update', name + " has joined the server.");

    function updatePeople(people) {
      var peopleString = "";
      for (var id in people) {
        peopleString += people[id] + ", ";
      }
      io.sockets.emit('update-people', peopleString);
    }
    updatePeople(people);

  	client.on('send', function(msg) {
  		io.sockets.emit('chat', people[client.id], msg);
  	});

    client.on('disconnect', function() {
      io.sockets.emit('update', people[client.id] + "has left the server.");
      delete people[client.id];
      updatePeople(people);
    });
  });
});
