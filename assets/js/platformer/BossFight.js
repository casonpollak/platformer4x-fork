import Character from './Character.js';
import GameEnv from './GameEnv.js';
import GameControl from './GameControl.js';
import Laser from './Laser.js';
import Enemy from './Enemy.js';
import TitanHealth from './TitanHealth.js';

export class BossFight extends Character {
    // Constructor sets up Character object 
    constructor(canvas, image, data, xPercentage, yPercentage, name, minPosition) {
        super(canvas, image, data);

        // Titan properties
        this.name = name;
        this.y = yPercentage;
        this.x = xPercentage * GameEnv.innerWidth;
        this.minPosition = minPosition * GameEnv.innerWidth;
        this.maxPosition = this.x + xPercentage * GameEnv.innerWidth;

        // Health properties
        this.maxHp = 100; // Maximum health points
        this.currentHp = 100; // Current health points
        this.titanHealthBar = new TitanHealth(
            150, 10, // Width and height of the health bar
            this.canvas.width, this.canvas.height, // Titan dimensions
            this.maxHp, this.currentHp, // Titan's max and current health
            this.x, this.y // Titan's position
        );

        // State properties
        this.state = {
            isDead: false // New state for checking if Titan is dead
        };

        // Laser-related properties
        this.immune = 0;
        this.debounce = 0;
        this.laser = document.getElementById("Laser");
        this.laserHeight = this.laser.innerHeight;

        // New property to randomize laser delay
        this.laserFireDelay = this.getRandomLaserDelay();
    }

    hpLoss() {
        if (GameEnv.playerAttack && !this.state.isDead) {
            this.currentHp -= 1;
        }
    }

    // Method to handle Titan's death state (makes the Titan disappear)
    handleDeath() {
        if (this.currentHp <= 0 && !this.state.isDead) {
            this.state.isDead = true; // Set the Titan as dead
            GameEnv.invincible = true; // Make invincible 
            this.canvas.style.display = "none"; // Hide the Titan's canvas (makes it disappear)
            GameEnv.playSound("goombaDeath"); // Play the death sound
        }
    }

    // Method to get a random delay between 1 and 10 seconds (converted to frames)
    getRandomLaserDelay() {
        const minDelay = 60; // 1 second = 60 frames
        const maxDelay = 600; // 10 seconds = 600 frames
        return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    }

    update() {
        super.update();

        // Check if the Titan should take damage
        this.hpLoss();

        // Check if the Titan should die and disappear
        this.handleDeath();

        // Only continue if Titan is not dead
        if (!this.state.isDead) {
            // Health bar update
            this.titanHealthBar.updateTitanHealth(
                this.currentHp, 
                this.x, 
                this.y, 
                this.canvas.width, 
                this.canvas.height
            );
            this.titanHealthBar.update();

            // Laser-related logic
            this.immune = 1;

            // Randomize the laser fire timing based on the laserFireDelay
            if (this.debounce < this.laserFireDelay && this.debounce > -1) {
                this.laser.style.left = `-2000px`;
                this.x = GameEnv.PlayerPosition.playerX - 0.14 * GameEnv.innerWidth;
                this.debounce += 1;
            }
            if (this.debounce < -120) {
                this.debounce += 1;
                if (this.debounce === -235) {
                    GameEnv.playSound("laserCharge");
                    this.laser.style.transform = `scaleY(${0})`;
                }
                this.canvas.style.filter = `invert(${this.debounce + 240}%)`;
            } else if (this.debounce < 0 && this.debounce >= -120) {
                this.debounce += 1;
                this.canvas.style.filter = `invert(0%)`;
                this.laser.style.left = `${this.x + 0.14 * GameEnv.innerWidth}px`;
                this.laser.style.transform = `scaleY(${(this.debounce + 120) / 40})`;
                this.laser.style.top = `${(this.debounce + 120) * 6}px`;
                if (this.debounce === -115) {
                    GameEnv.playSound("laserSound");
                }

                const plrPos = GameEnv.PlayerPosition.playerX;

                if (this.x >= plrPos - 250 && this.x <= plrPos - 150) {
                    this.killBeam(GameEnv.player);
                    this.debounce = 0;
                    this.laser.style.left = `${this.x + 0.14 * GameEnv.innerWidth}px`;
                    // Attempt to randomize laser after each shot
                    this.laserFireDelay = this.getRandomLaserDelay();
                }
            }

            if (this.debounce === this.laserFireDelay) {
                this.debounce = -240;
            }

            // Additional difficulty-specific adjustments
            if (GameEnv.difficulty === "hard") {
                this.canvas.style.filter = "invert(100%)";
                this.canvas.style.scale = 1.25;
                this.immune = 1;
            } else if (GameEnv.difficulty === "impossible") {
                this.canvas.style.filter = 'brightness(1000%)';
                this.immune = 1;
            }

            // Positioning and movement adjustments
            this.y = 0.25 * GameEnv.innerHeight;
            this.playerBottomCollision = false;
        }
    }
}
export default BossFight;