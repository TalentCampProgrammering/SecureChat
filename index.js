var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

app.listen(1234);
var people = {};

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

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
