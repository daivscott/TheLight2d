// reference the express module
var express = require('express');
// create new instance of express called app
var app = express();
// supply "app" to http server to handle requests
var server = require('http').Server(app);
// reference socket.io set to listen to the server
var io = require('socket.io').listen(server);

// object to track players
var players = {};

// update server to render static files
app.use(express.static(__dirname + '/public'));

// set index.html as root page on server
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// logic to listen for connections/disconnections
io.on('connection', function (socket) {
    console.log('a user connected');
    // create a new player and add it to our players object
    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        playerId: socket.id,
        team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
    };
    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // when a player disconnects, remove them from our players object
    socket.on('disconnect', function () {
        console.log('user disconnected');
        // remove this player from our players object
        delete players[socket.id];
        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
    });
    // when a player moves, update the player data
    socket.on('playerMovement', function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });
});

// set the server to listen on port 8081
server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});