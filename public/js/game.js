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
};

function create() {
    var self = this;
    this.socket = io();
    // callback to listen for currentPlayers
    this.socket.on('currentPlayers', function (players) {
        // loop through players and check id's match socket id
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                // call addPlayer function and pass current player info
                addPlayer(self, players[id]);
            }
        });
    });
};

function update() {};

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