class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOverScene");
    }

    create() {
        // set the background color
        this.cameras.main.setBackgroundColor('#ffe1e6');

        // get the center coordinates of the game canvas
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // display game over text
        this.add.text(centerX, centerY - 50, 'Game Over', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        // add a restart button
        const restartButton = this.add.text(centerX, centerY + 50, 'Restart', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        restartButton.setInteractive(); // Make the text clickable

        // handle restart button click
        restartButton.on('pointerdown', () => {
            this.scene.start('platformerScene');
        });
    }
}
