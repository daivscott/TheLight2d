// game config
var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },

    // embed the scene object
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Pass config object to Phaser
var game = new Phaser.Game(config);

function preload() {
    // load the ship image
    this.load.image('ship', 'assets/spaceShips_001.png');
    this.load.image('otherPlayer', 'assets/enemyBlack5.png');
};

function create() {
    var self = this;
    this.socket = io();
    // create new group called otherPlayer
    this.otherPlayers = this.physics.add.group();
    // callback to listen for currentPlayers
    this.socket.on('currentPlayers', function (players) {
        // loop through players and check id's match socket id
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                // call addPlayer function and pass current player info
                addPlayer(self, players[id]);
            } else {
                addOtherPlayers(self, players[id]);
            }
        });
    });
    // listen for events
    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });

    // listen for disconnects
    this.socket.on('disconnect', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            // destroy game objects that are disconnected
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });
    // populate cursor object
    this.cursors = this.input.keyboard.createCursorKeys();
};

function update() {
    if (this.ship) {
        // check for forward movement input
        if (this.cursors.left.isDown) {
            this.ship.setAngularVelocity(-150);
        } else if (this.cursors.right.isDown) {
            this.ship.setAngularVelocity(150);
        } else {
            this.ship.setAngularVelocity(0);
        }

        // check for players rotational movement
        if (this.cursors.up.isDown) {
            this.physics.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration);
        } else {
            this.ship.setAcceleration(0);
        }
        // allows the players to infinitely wrap across the screen
        this.physics.world.wrap(this.ship, 5);
    }
};

function addPlayer(self, playerInfo) {
    // create ship with arcade physics, set centred origin and scale
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    // set player colour
    if (playerInfo.team === 'blue') {
        self.ship.setTint(0x0000ff);
    } else {
        self.ship.setTint(0xff0000);
    }
    // set movement resistance
    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    // set max speed
    self.ship.setMaxVelocity(200);
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    if (playerInfo.team === 'blue') {
        otherPlayer.setTint(0x0000ff);
    } else {
        otherPlayer.setTint(0xff0000);
    }
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}