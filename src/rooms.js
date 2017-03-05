import BEM from 'bem.js';
import MainLoop from 'mainloop.js';
import { CANVAS, CTX } from './canvas';
import { FallingBLock, EnemyEasy, EnemyMedium, EnemyHard, PoleFactory } from './enemies';
import { GameSprite, GameBackground, GameRoom } from './gameclasses';
import { SPRITE_PLATFORM, SPRITE_PLATFORM_TOP, PLATORM_BUFFER, PlatformFactory, PlatformBlock, PlatformBlockTop } from './platform';
import { Player } from './player';


/** {HTMLImageElement} representing the blue background. */
const ASSET_BACKGROUND_BLUE = BEM.getBEMNode('background', false, 'blue');

/** {HTMLImageElement} representing the green background. */
const ASSET_BACKGROUND_CLOUD = BEM.getBEMNode('background', false, 'cloud');

/** {HTMLImageElement} representing the gray background. */
const ASSET_BACKGROUND_GRAY = BEM.getBEMNode('background', false, 'gray');

/** {GameSprite} representing the blue background. */
const BACKGROUND_BLUE = new GameBackground([ASSET_BACKGROUND_BLUE]);

/** {GameSprite} representing the green background. */
const BACKGROUND_CLOUD = new GameBackground([ASSET_BACKGROUND_CLOUD]);

/** {GameSprite} representing the gray background. */
const BACKGROUND_GRAY = new GameBackground([ASSET_BACKGROUND_GRAY]);

/** {string} render quality. */
const GFX_MODE_LOW_DETAIL = 'low detail';

/** {string} render quality. */
const GFX_MODE_HIGH_DETAIL = 'high detail';

/** {number} Frame rate boundary (low datail below). */
const GFX_MIN_FFAME_RATE = 30;

/** {number} maximum (negative) speed. */
const MAX_SPEEDH = -30;

/** {number} minimum divider for game speed */
const MIN_GAME_SPEED_INTERVAL = 5;


/** {number} Offset in pixels (from bottom of canvas) where objects are spawned. */
const SPAWN_OFFSET = 320;



/**
 * The playable level.
 * @class
 */
export class Level extends GameRoom {
    constructor() {
        super();
        this.background1 = BACKGROUND_BLUE;
        this.background2 = BACKGROUND_CLOUD;
        this.gameSpeedInterval = 20;
        this.gfxMode = GFX_MODE_LOW_DETAIL;
        this.lastSpawn1 = 0;
        this.lastSpawn2 = 0;
        this.lastSpawn3 = 0;
        this.lastSpawn4 = 0;
        this.lastSpawn5 = 0;        
        this.level = 1;
        this.objects = [];
        this.platformFactory = new PlatformFactory();
        this.poleFactory = new PoleFactory()
        this.score = 0;
        this.speedH = -5;
        this.screenMessage1 = null;
        this.screenMessage2 = null;
        clearTimeout(this.screenMessage2Timeout)

        this.setSpeedH(-5);
        this.createFloor();
        this.createInitialObjects();
    }

    /**
     * Draws everything in this room.
     */
    draw() {
        CTX.clearRect(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);

        if (this.gfxMode === GFX_MODE_HIGH_DETAIL) {
            let grd=CTX.createLinearGradient(0, 100, 0, 0);
            grd.addColorStop(0,"rgb(217, 246, 249)");
            grd.addColorStop(1,"white");

            CTX.fillStyle=grd;
            CTX.rect(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);
            CTX.fill();
        }

        this.background2.y = 0;
        this.background2.draw();
        this.background1.y = CANVAS.clientHeight - SPRITE_PLATFORM.height / 2 - SPRITE_PLATFORM_TOP.height / 2 - this.background1.height;
        this.background1.draw();        
        this.objects.forEach((object) => object.draw());
        this.drawHud();
    }

    /**
     * Update the state of this object.
     * Gets fired by MainLoop.
     */
    update(delta) {
        delta = Math.round(delta);
        delta = delta / Math.max(this.gameSpeedInterval, MIN_GAME_SPEED_INTERVAL);
        super.update(delta);

        if (this.screenMessage1) {
            return;
        }

        this.screenMessage2 = null;        
        this.level = Math.ceil(this.score / 1000);
        this.score = Math.round(this.score + -this.speedH * delta);
        this.objects.forEach((object) => object.update(delta));
        this.background1.update(delta);
        this.background2.update(delta);
        this.removeObjectsOutsideRoom();
        this.updateEnemies(delta);

        if (MainLoop.getFPS() < GFX_MIN_FFAME_RATE) {
            this.gfxMode = GFX_MODE_LOW_DETAIL;
        }
    }

    /**
     * Creates the bottom floor.
     */
    createFloor() {
        let h = SPRITE_PLATFORM.height;
        let y = CANVAS.clientHeight - SPRITE_PLATFORM.width / 2 - SPRITE_PLATFORM_TOP.height;
        let n = CANVAS.width / SPRITE_PLATFORM_TOP.width + PLATORM_BUFFER;

        for (let i=0; i<n/4; i++) {
            let x = i * SPRITE_PLATFORM.width * 4;
            this.platformFactory.create(this, x, y, n / 4);
        }
    }

    /**
     * Creates the first batch of objects.
     */
    createInitialObjects() {
        this.createObject(Player, 70, CANVAS.height - SPAWN_OFFSET);
        this.updateEnemies(1, true);

    }

    /**
     * Creates a new gameObject at x, y
     */
    createObject(gameObject, x, y) {
        let object = new gameObject(this);
        object.x = x;
        object.y = y;
        this.objects.push(object);
    }

    /**
     * Removes objects with y > room height.
     */
    removeObjectsOutsideRoom() {
        this.objects = this.objects.filter((object, index) => {
            if (object.y < CANVAS.clientHeight) {
                return true;
            }
        });
    }

    /**
     * Adds enemeis (if needed).
     * @param {number} delta.
     * @param {boolean} force.
     */
    updateEnemies(delta, force=false) {
        this.setSpeedH(-5);
        let rand = Math.random();

        if (this.score - this.lastSpawn1 > 1000 || force) {
            this.updateEnemies1(delta);
            this.lastSpawn1 = this.score;

        }
        
        if (this.score - this.lastSpawn2 > 2100 ) {
            this.updateEnemies2(delta);
            this.lastSpawn2 = this.score;
        }
        
        if (this.score - this.lastSpawn3 > 3300 ) {
            this.updateEnemies3(delta);
            this.lastSpawn3 = this.score;
        }
        
        if (this.score - this.lastSpawn4 > 4400 ) {
            this.updateEnemies4(delta);
            this.lastSpawn4 = this.score;
        }
        
        if (this.score - this.lastSpawn5 > 5500 ) {
            this.updateEnemies5(delta);
            this.lastSpawn5 = this.score;
            this.gameSpeedInterval--;
        }

    }

    updateEnemies1(delta) {
        // Create pole
        if (this.score <= 500) {
            this.poleFactory.create(this, 0, CANVAS.clientWidth - 50, CANVAS.height - SPAWN_OFFSET);
        } else {
            this.poleFactory.create(this, Math.floor(Math.random() * 3) , CANVAS.clientWidth - 50, CANVAS.height - SPAWN_OFFSET);
        }
    
    }
    updateEnemies2(delta) {
        this.createObject(FallingBLock, Math.random() * CANVAS.clientWidth, CANVAS.height - SPAWN_OFFSET);
    }

    updateEnemies3(delta) {
        this.createObject(EnemyEasy, CANVAS.clientWidth - 50, CANVAS.height - SPAWN_OFFSET);
        this.gameSpeedInterval--;
    }

    updateEnemies4(delta) {
        this.createObject(EnemyMedium, CANVAS.clientWidth - 50, CANVAS.height - SPAWN_OFFSET);
    }

    updateEnemies5(delta) {
        this.createObject(EnemyHard, CANVAS.clientWidth - 50, CANVAS.height - SPAWN_OFFSET);
    }

    /**
     * Sets the speed of the room/game.
     * @param {number} value The speed.
     */
    setSpeedH(value) {
        this.speedH = value;
        this.background1.speedH = this.speedH / 4;
        this.background2.speedH = this.speedH / 12;

        let objects = this.objects.forEach((object) => {
            if (object.constructor.name === PlatformBlock.name ||
                object.constructor.name === PlatformBlockTop.name) {
                    object.speedH = value;
                }
        });

    }

    /**
     * Draws the HUD on the screen.
     */
    drawHud() {
        let fontSize = 30;
        CTX.font=`${fontSize}px pressstart`;
        CTX.fillStyle='#FFF';
        CTX.strokeStyle='#000';

        CTX.textAlign='start';
        CTX.fillText(`L${this.level}`, 10, fontSize + 10);
        CTX.strokeText(`L${this.level}`, 10, fontSize + 10);

        // CTX.fillText(`S${-this.speedH.toFixed(1)}`, 160, fontSize + 10);
        // CTX.strokeText(`S${-this.speedH.toFixed(2)}`, 160, fontSize + 10);

        // CTX.fillText(`FPS${parseInt(MainLoop.getFPS())}`, 310, fontSize + 10);
        // CTX.strokeText(`FPS${parseInt(MainLoop.getFPS())}`, 310, fontSize + 10);

        CTX.textAlign='end';
        CTX.fillText(`${this.score}`, Math.min(window.innerWidth, CANVAS.clientWidth) - 10, fontSize + 10);
        CTX.strokeText(`${this.score}`, Math.min(window.innerWidth, CANVAS.clientWidth) - 10, fontSize + 10);

        if (this.screenMessage1) {
            CTX.textAlign = 'center';
            CTX.fillText(this.screenMessage1, window.innerWidth / 2, window.innerHeight / 2 - 30);
            CTX.strokeText(this.screenMessage1, window.innerWidth / 2, window.innerHeight / 2 - 30);
        }

        if (this.screenMessage2) {
            CTX.textAlign = 'center';
            CTX.fillText(this.screenMessage2, window.innerWidth / 2, window.innerHeight / 2 + 30);
            CTX.strokeText(this.screenMessage2, window.innerWidth / 2, window.innerHeight / 2+ 30);
        }
    }

    /**
     * Stops the room.
     */
    end() {
        this.setSpeedH(0);
        let isHighScore = this.isHighScore();
        this.screenMessage1 = (isHighScore) ? `High score: ${this.score}` : 'Game over';
        this.screenMessage2Timeout = setTimeout(() => {
            this.screenMessage2 = "Tap to restart"
            CANVAS.addEventListener('click', this.restart.bind(this));
            CANVAS.addEventListener('touchstart', this.restart.bind(this));
        }, 600)
    }

    /**
     * Check i( score is a new high score.
     * Sets highscore if so.
     * @returns {boolean}
     */
    isHighScore() {
        if (this.score > this.getHighScore()) {
            return this.setHighScore();
        }
        return false;
    }

    /**
     * Returns the high score.
     * @returns {number}
     */
    getHighScore() {
        let score = 0;
        try {
            score = localStorage.getItem('highscore');
        } catch(e) {
            return score;
        }
        return score;
    }

    /**
     * Sets the current score as high score.
     * @returns {number|false} New high score if succesfull, false otherwise.
     */
    setHighScore() {
        try {
            localStorage.setItem('highscore', this.score);
            return this.score;
        } catch(e) {
            return false;
        }
    }

    /**
     * Restarts this room.
     */
    restart() {
        clearTimeout(this.screenMessage2Timeout);

        if (this.screenMessage1) {
            this.objects.forEach((object) => {
                object.y = CANVAS.clientHeight * 2;
                object = null;
            });

            this.constructor();
        }
    }
}