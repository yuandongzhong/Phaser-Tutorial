/*global Phaser*/

var playState = {

    create: function() {
        this.player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
        this.player.anchor.setTo(0.5,0.5);
        
        this.player.animations.add('right', [1, 2], 8, true);
        this.player.animations.add('left', [3, 4], 9, true);
        
        // Tell Phaser that the player will use the Arcade physics engine
        game.physics.arcade.enable(this.player);
        
        // Add vertical gravity to the player
        this.player.body.gravity.y = 500;
        
        this.cursor = game.input.keyboard.createCursorKeys();
        
        this.createWorld();
        
        // Display the coin
        this.coin = game.add.sprite(60, 140, 'coin');
        
        // Add Arcade physics to the coin
        game.physics.arcade.enable(this.coin);
        
        // Set the anchor point of the coin to its center
        this.coin.anchor.setTo(0.5, 0.5);
        
        // Display the score
        this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff' });
        
        // Initialise the score vaiable
        game.global.score = 0;
        
        // Create an enemy group with Arcade phycis
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        
        // Create 10 enemies with the 'enemy' image in the group
        // The enemies are "dead" by default. so they are not visible in the game
        this.enemies.createMultiple(10, 'enemy');
        
//        // Call 'addEnemy' every 2.2 seconds
//        game.time.events.loop(2200, this.addEnemy, this);
        
        // Contains the time of the next enemy creation
        this.nextEnemy = 0;
        
        this.jumpSound = game.add.audio('jump');
        this.coinSound = game.add.audio('coin');
        this.deadSound = game.add.audio('dead');
        
        // Create the emitter with 15 particles. We don't need to set the x and y // Since we don't know where to do the explosion yet
        this.emitter = game.add.emitter(0, 0, 15);
        
        // Set the 'pixel' image for the particles
        this.emitter.makeParticles('pixel');
        
        // Set the y speed of the particles between -150 and 150
        // The speed will be randomly picked between -150 and 150 for each particle
        this.emitter.setYSpeed(-150, 150);
        this.emitter.setXSpeed(-150, 150);
        
        // Use no gravity for the particles
        this.emitter.gravity = 0;
        
        game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT]);
        
        this.wasd = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D)
        };
        
        // If the game is running on a mobile device
        if (!game.device.desktop) {
            // Display the mobile inputs
            this.addMobileInputs();
        }
    },
    
    update: function() {
        game.physics.arcade.collide(this.player, this.layer);
        this.movePlayer();
        
        if(!this.player.inWorld) {
            this.playerDie();
        }
        
        game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
        
        // Make the enemies and walls collide
        game.physics.arcade.collide(this.enemies, this.layer);
        
        // Call the 'playerDie' function when the player and an enemy overlap
        game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
        
        // If the 'nextEnemy' time has passed
        if (this.nextEnemy < game.time.now) {
            // Define our variables
            var start = 4000, end = 1000, score = 100;
            
            // Formula to decrease the delay between enemies over time
            // At first it's 4000ms, then slowly goes to 1000ms
            var delay = Math.max(start - (start - end)*game.global.score/score, end);
            
            // Create a new enemy, and update the 'nextEnemy' time
            this.addEnemy();
            this.nextEnemy = game.time.now + delay;     
        }
        
    },
    
    movePlayer: function() {
        if (this.cursor.left.isDown || this.wasd.left.isDown || this.moveLeft) {
            this.player.body.velocity.x = -200;
            this.player.animations.play('left');
        }
        
        else if (this.cursor.right.isDown || this.wasd.right.isDown || this.moveRight) {
            this.player.body.velocity.x = 200;
            this.player.animations.play('right');
        }
        
        else {
            this.player.body.velocity.x = 0;
            this.player.animations.stop();
            this.player.frame = 0;
        }
        
        if ((this.cursor.up.isDown || this.wasd.up.isDown) && this.player.body.onFloor()) {
            this.jumpPlayer();
        }  
    },
    
    createWorld: function() {        
        // Create the tilemap
        this.map = game.add.tilemap('map');
        
        // Add the tileset to the map
        this.map.addTilesetImage('tileset');
        
        // Create the layer, by specifying the name of the Tiled layer
        this.layer = this.map.createLayer('Tile Layer 1');
        
        // Set the world size to match the size of the layer
        this.layer.resizeWorld();
        
        // Enable collisions for the first element of our tileset (the blue wall)
        this.map.setCollision(1);
    },
    
    playerDie: function() {
        
        // If the player is already dead, do nothing
        if (!this.player.alive) {
            return;
        }
        
        
        this.player.kill();
        
        this.deadSound.play(); 
        
        // Set the position of the emitter on the player
        this.emitter.x = this.player.x;
        this.emitter.y = this.player.y;
        
        // Start the emitter, by exploding 15 particles that will live for 600ms
        this.emitter.start(true, 600, null, 15);
        
        // Call the 'startMenu' function in 1000ms
        game.time.events.add(1000, this.startMenu, this);
    },
    
    takeCoin: function(player, coin) {
        game.global.score += 5;
        this.scoreLabel.text = 'score: ' + game.global.score;
    
        this.updateCoinPosition();
        this.coinSound.play();
        
        game.add.tween(this.player.scale).to({x: 1.3, y: 1.3}, 50).to({x: 1, y: 1}, 150).start();
    },

    updateCoinPosition: function() {
        // Store all the possible coin positions in an array
        var coinPosition = [
            {x: 140, y: 60}, {x: 360, y: 60}, // Top row
            {x: 60, y: 140}, {x: 440, y: 140}, // Middle row
            {x: 130, y: 300}, {x: 370, y: 300} // Bottom row
        ];

        // Remove the current coin position from the array
        // Otherwise the coin would appear at the same spot twice in a row
        for (var i = 0; i < coinPosition.length; i++) {
            if (coinPosition[i].x === this.coin.x) {
                coinPosition.splice(i, 1);
            }
        }

        // Randomly select a position from the array
        var newPosition = coinPosition[
            game.rnd.integerInRange(0, coinPosition.length-1)];

        // Set the new position of the coin
        this.coin.reset(newPosition.x, newPosition.y);
        
        this.coin.scale.setTo(0,0);
        game.add.tween(this.coin.scale).to({x: 1, y: 1}, 300).start();
    },
    
    addEnemy: function() {
        // Get the first dead enemy of the group
        var enemy = this.enemies.getFirstDead();
    
        // If there isn't any dead enemy, do nothing
        if (!enemy) {
            return;
        }
        
        // Initialise the enemy
        enemy.anchor.setTo(0.5, 1);
        enemy.reset(game.world.centerX, 0);
        enemy.body.gravity.y = 500;
        enemy.body.velocity.x = 100 * Phaser.Math.randomSign();
        enemy.body.bounce.x = 1;
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
    },
    
    startMenu: function() {
        game.state.start('menu');
    },
    
    addMobileInputs: function() {
        // Add the jump button
        this.jumpButton = game.add.sprite(350, 247, 'jumpButton');
        this.jumpButton.inputEnabled = true;
        this.jumpButton.alpha = 0.5;
        this.jumpButton.events.onInputDown.add(this.jumpPlayer, this); 
        
        // Movement variables
        this.moveLeft = false;
        this.moveRight = false;
        
        // Add the move left button
        this.leftButton = game.add.sprite(50, 247, 'leftButton');
        this.leftButton.inputEnabled = true;
        this.leftButton.events.onInputOver.add(function(){this.moveLeft=true;}, this);
        this.leftButton.events.onInputOut.add(function(){this.moveLeft=false;}, this);
        this.leftButton.events.onInputDown.add(function(){this.moveLeft=true;}, this);
        this.leftButton.events.onInputUp.add(function(){this.moveLeft=false;}, this);
        this.leftButton.alpha = 0.5;
               
        // Add the move right button
        this.rightButton = game.add.sprite(130, 247, 'rightButton');
        this.rightButton.inputEnabled = true;
        this.rightButton.events.onInputOver.add(function(){this.moveRight=true;}, this);
        this.rightButton.events.onInputOut.add(function(){this.moveRight=false;}, this);
        this.rightButton.events.onInputDown.add(function(){this.moveRight=true;}, this);
        this.rightButton.events.onInputUp.add(function(){this.moveRight=false;}, this);
        this.rightButton.alpha = 0.5;

    },
    
    jumpPlayer: function() {
        // If the player is touching the ground
        if (this.player.body.onFloor()) {
            // Jump with sound
            this.player.body.velocity.y = -320;
            this.jumpSound.play();
        }
    },
}
