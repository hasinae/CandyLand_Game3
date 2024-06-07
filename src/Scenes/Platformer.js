class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
        this.coinCount = 0;
        this.coinText = null;
    }

    // init() {
    //     // variables and settings
    //     this.ACCELERATION = 400;
    //     this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
    //     this.physics.world.gravity.y = 1500;
    //     this.JUMP_VELOCITY = -600;
    //     this.PARTICLE_VELOCITY = 50;
    //     this.SCALE = 2.0;
    // }

    init() {
        // variables and settings
        this.ACCELERATION = 350;
        this.DRAG = 1000;       
        this.MAX_VELOCITY = 200; 
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
    }

    create() {

        this.cameras.main.setBackgroundColor('#cfe2f3');

        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);


        // Load audio objects
        this.donutSound = this.sound.add('donutSound');
        this.burgerSound = this.sound.add('burgerSound');


        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // TODO: Add createFromObjects here
        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 14
        });

        // TODO: Add turn into Arcade Physics here
        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // Create text object to display coin count
        this.coinText = this.add.text(16, 16, 'Donuts Collected: 0', { fontSize: '24px', fill: '#fff' });
        // this.rules = this.add.text(, , 'Collect at least 15 donuts to win! Avoid burgers or else your score will decrease!', { fontSize: '16px', fill: '#fff' });
        this.rules = this.add.text(this.coinText.x, this.coinText.y + this.coinText.height + 10, 'Collect at least 15 donuts to win!\nAvoid burgers or else your score will decrease!', { fontSize: '12px', fill: '#fff' });


        // Find burgers in the "Objects" layer in Phaser
        this.burgers = this.map.createFromObjects("Objects", {
            name: "burger",
            key: "tilemap_sheet",
            frame: 90 // Assuming frame index for burger
        });

        // Enable Arcade Physics for the burger objects
        this.physics.world.enable(this.burgers, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.burgers
        this.burgerGroup = this.add.group(this.burgers);

        // Handle collision detection with burgers
        this.physics.add.overlap(my.sprite.player, this.burgerGroup, (player, burger) => {
            burger.destroy(); // remove burger on overlap
            this.burgerSound.play();
            this.updateCoinCount(-1); // Call method to update score by subtracting 1
        });

        // TODO: Add coin collision handler
        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.donutSound.play();
            this.updateCoinCount(); // Call method to update coin count
        });

        // Create a layer for the lolipop object
        this.lolipopLayer = this.map.createLayer("lolipop", this.tileset, 0, 0);

        // Find lolipops in the "Objects" layer in Phaser
        this.lolipops = this.map.createFromObjects("Objects", {
            name: "lolipop",
            key: "tilemap_sheet", // Assuming the lolipop texture is part of the tilemap sheet
            frame: 8 
        });

        // Enable Arcade Physics for the lolipop objects
        this.physics.world.enable(this.lolipops, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.lolipops
        this.lolipopGroup = this.add.group(this.lolipops);

        // // Handle collision detection with lolipops
        // this.physics.add.overlap(my.sprite.player, this.lolipopGroup, () => {
        //     // Game over logic here
        //     console.log("Game over! Player reached the lolipop.");
        //     this.scene.start("GameOverScene");
        // });

            // Handle collision detection with lolipops
    this.physics.add.overlap(my.sprite.player, this.lolipopGroup, () => {
        if (this.coinCount >= 15) {
            console.log("Game over! Player reached the lolipop.");
            this.scene.start("GameOverScene");
        } else {
            console.log("Not enough donuts collected to finish the game.");
            
            // For example, you can display a message to the player
            const message = this.add.text(450, 100, 'Collect at least 15 donuts to finish the game!', { fontSize: '14px', fill: '#ff0000' });
            // You can also add a delay and then remove the message
            this.time.delayedCall(3000, () => {
                message.destroy();
            }, [], this);
        }
    });

        
        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        
        // Horizontal movement particles
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['dust_01.png', 'dust_02.png'],
            scale: { start: 0.05, end: 0.1 },
            lifespan: 300,
            maxParticles: 10,
            emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-10, -10, 20, 20) },
            frequency: 50,
            alpha: { start: 0.8, end: 0 },
            speedX: { min: -20, max: 20 },
            speedY: { min: -10, max: 10 },
            blendMode: 'ADD',
        });
        my.vfx.walking.stop();

        // Vertical movement particles (jumping)
        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['bubble_01.png', 'bubble_02.png'],
            scale: { start: 0.1, end: 0.2 },
            lifespan: 500,
            maxParticles: 5,
            emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, 5) },
            frequency: -1, // emit on demand
            alpha: { start: 1, end: 0 },
            speedY: { min: -30, max: -50 },
            blendMode: 'SCREEN',
        });



        // TODO: add camera code here
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
    }

    // updateCoinCount() {
    //     // this.coinCount++; // Increment coin count
    //     // console.log(`Coins collected: ${this.coinCount}`);
    //     // // You can update the UI to display the coin count here if needed
    //     this.coinCount++; // Increment coin count
    //     console.log(`Burgers collected: ${this.coinCount}`);
    //     this.coinText.setText(`Burgers: ${this.coinCount}`);
    // }
    // updateCoinCount(change) {
    //     this.coinCount += change; // Increment or decrement coin count based on the change parameter
    //     console.log(`Burgers collected: ${this.coinCount}`);
    //     this.coinText.setText(`Burgers: ${this.coinCount}`);
    // }

    updateCoinCount(amount = 1) {
        this.coinCount += amount; // Increment or decrement coin count
        console.log(`Donuts collected: ${this.coinCount}`);
        this.coinText.setText(`Donuts Collected: ${this.coinCount}`);
    }
    

    update() {
        if (cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
        } else if (cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, true);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }
    
        if (!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
    
        if (my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jumping.emitParticleAt(my.sprite.player.x, my.sprite.player.y);
        }
    
        // Check if the player falls off the map
        if (my.sprite.player.y > this.map.heightInPixels) {
            // Restart the game
            this.scene.restart();
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
    
}
