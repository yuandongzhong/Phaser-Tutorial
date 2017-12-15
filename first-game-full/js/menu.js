var menuState = {
    
    create: function() {
        // Add a background image
        game.add.image(0, 0, 'background');
        
        // Display the name of the game
        var nameLabel = game.add.text(game.world.centerX, -50, 'Super Coin Box', { font: '50px Geo', fill: '#ffffff' });
        nameLabel.anchor.setTo(0.5, 0.5);
        
        // Create a tween on the label
        var tween = game.add.tween(nameLabel);
        
        // Change the y position of the label to 80, in 1000ms
        tween.to({y: 80}, 1000).easing(Phaser.Easing.Bounce.Out);
        
        // Start the tween
        tween.start();
          
        // If 'bestScore' is not defined
        // It means that this is the first time the game is played
        if(!localStorage.getItem('bestScore')) {
            localStorage.setItem('bestScore', 0);
        }
        
        // If the score is higher than the best score
        if (game.global.score > localStorage.getItem('bestScore')) {
            // Then update the best score
            localStorage.setItem('bestScore', game.global.score);
        }
        
        // Show the score at the center of the screen
        var text = 'score: ' + game.global.score + '\nbest score: ' + localStorage.getItem('bestScore');
        var scoreLabel = game.add.text(game.world.centerX, game.world.centerY, text, { font: '25px Arial', fill: '#ffffff', align: 'center'});
        scoreLabel.anchor.setTo(0.5, 0.5);
        
        // Explain how to start the game
        if (game.device.desktop) {
            var text = 'press the up arrow key to start';
        } else {
            var text = "touch the screen to start";
        }
        
        // Display the text variable
        var startLabel = game.add.text(game.world.centerX, game.world.height-80, text, { font: '25px Arial', fill: '#ffffff' });
        
        startLabel.anchor.setTo(0.5, 0.5);
        
        var tween2 = game.add.tween(startLabel);
        
        // Rotate the label to -2 degrees in 500ms
        tween2.to({angle: -2}, 500);
        
        // Then rotate the label to +2 degrees in 500ms
        tween2.to({angle: 2}, 500);
        
        // Loop indefinitely the tween
        tween2.loop();
        
        // Start the tween
        tween2.start();
        
        // Create a new Phaser keyboard variable: the up arrow key
        var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        upKey.onDown.addOnce(this.start, this);
        
        // When the input (either the mouse or a finger) is pressed, the start function will be called to start the play state.
        game.input.onDown.addOnce(this.start, this);

        
        // Add the mute button that calls the 'toggleSound' function when pressed
        this.muteButton = game.add.button(20, 20, 'mute', this.toggleSound, this);
        
        // If the game is already muted
        if (game.sound.mute) {
            this.muteButton.frame = 1;
        }
        
        // If the mouse if over the button, it becomes a hand cursor
        this.muteButton.input.useHandCursor = true;
        
    },
    
    start: function() {
        // Start the actual game
        game.state.start('play');
    },
    
    toggleSound: function() {
        game.sound.mute = !game.sound.mute;
        this.muteButton.frame = game.sound.mute ? 1 : 0;
    },
};