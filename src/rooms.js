import BEM from 'bem.js';
import MainLoop from 'mainloop.js';
import { CANVAS, CTX } from './canvas';
import { FallingBLock, EnemyEasy, EnemyMedium, PoleFactory } from './enemies';
import { GameSprite, GameBackground, GameRoom } from './gameclasses';
import { SPRITE_PLATFORM, SPRITE_PLATFORM_TOP, PLATORM_BUFFER, PlatformBlock, PlatformBlockTop } from './platform';
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
const BACKGROUND_GREEN = new GameBackground([ASSET_BACKGROUND_CLOUD]);

/** {GameSprite} representing the gray background. */
const BACKGROUND_GRAY = new GameBackground([ASSET_BACKGROUND_GRAY]);

/** {number} maximum (negative) speed. */
const MAX_SPEEDH = -30;

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
        this.background2 = BACKGROUND_GREEN;
        this.level = 1;
        this.objects = [];
        this.score = 0;
        this.speedH = -5;
        this.screenMessage1 = null;
        this.screenMessage2 = null;
        clearTimeout(this.screenMessage2Timeout)

        this.setSpeedH(-5);
        this.createInitialObjects();
        this.createFloor();

    }

    /**
     * Draws everything in this room.
     */
    draw() {
        this.background1.y = CANVAS.clientHeight - SPRITE_PLATFORM.height / 2 - SPRITE_PLATFORM_TOP.height / 2 - this.background1.height;
        this.background2.y = 0;


        let grd=CTX.createLinearGradient(0, 100, 0, 0);
        grd.addColorStop(0,"rgb(217, 246, 249)");
        grd.addColorStop(1,"white");

        CTX.fillStyle=grd;
        CTX.rect(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);
        CTX.fill();

        this.background2.draw();
        this.background1.draw();
        this.objects.forEach((object) => object.draw());
        this.drawHud();
    }

    /**
     * Update the state of this object.
     * Gets fired by MainLoop.
     */
    update() {
        if (this.screenMessage1) {
            return;
        }

        this.screenMessage2 = null;        
        this.level = Math.ceil(this.score / 1000);
        this.score++;
        this.objects.forEach((object) => object.update());
        this.background1.update();
        this.background2.update();
        this.removeObjectsOutsideRoom();
        this.updateEnemies(this.score);
    }

    /**
     * Creates the bottom floor.
     */
    createFloor() {
        let h = SPRITE_PLATFORM.height;
        let y = CANVAS.clientHeight - SPRITE_PLATFORM.originY;
        let y2 = y - SPRITE_PLATFORM_TOP.height;
        this.createPlatform(PlatformBlock, 0, y, CANVAS.width / SPRITE_PLATFORM.width + PLATORM_BUFFER);
        this.createPlatform(PlatformBlockTop, 0, y2, CANVAS.width / SPRITE_PLATFORM_TOP.width + PLATORM_BUFFER);
    }

    /**
     * Creates a platform.
     * @param {class} gameObjectClass.
     * @param {number} x X position to start placing objects.
     * @param {number} y Y position to place objects.
     * @param {number} n Amount of objects.
     */
    createPlatform(gameObjectClass, x, y, n) {
        for (let i=0; i<n; i++) {
            let gameObject = new gameObjectClass(this);
            gameObject.x = i * gameObject.sprite.width + x;
            gameObject.y = y;
            gameObject.speedH = this.speedH;
            this.objects.push(gameObject);
        }
    }

    /**
     * Creates the first batch of objects.
     */
    createInitialObjects() {
        this.createObject(Player, 70, CANVAS.height - SPAWN_OFFSET);
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
        this.objects = this.objects.filter((object) => {
            if (object.y < CANVAS.clientHeight) {
                return true;
            }
            object = null;
        });
    }

    /**
     * Adds enemeis (if needed)
     */
    updateEnemies() {
        let interval = 200;
        let rand = Math.random();

        // return;
        if (this.score % interval !== 0) {
            return;
        }

        this.level = Math.min(this.level, 4)
        this.setSpeedH(Math.max(this.speedH - 0.1, MAX_SPEEDH));


        switch(this.level) {
            case 4:
                if (rand > 0.50) {
                    if (rand > 0.5) { this.createObject(FallingBLock, Math.random() * CANVAS.clientWidth, CANVAS.height - SPAWN_OFFSET); }
                    else { 
                        if (rand > 0.75) {
                            this.createObject(EnemyEasy, Math.random() * CANVAS.clientWidth, CANVAS.height - SPAWN_OFFSET);
                        } else {
                            this.createObject(EnemyMedium, Math.random() * CANVAS.clientWidth, CANVAS.height - SPAWN_OFFSET);
                        }
                    }
                }
                new PoleFactory(this, Math.floor(Math.random() * 3) , CANVAS.clientWidth - 50, CANVAS.height - SPAWN_OFFSET);
                break;
            case 3:
                if (rand > 0.50) {
                    if (rand > 0.75) { this.createObject(FallingBLock, Math.random() * CANVAS.clientWidth, CANVAS.height - SPAWN_OFFSET); }
                    else { 
                        this.createObject(EnemyEasy, Math.random() * CANVAS.clientWidth, CANVAS.height - SPAWN_OFFSET);
                    }
                }
                new PoleFactory(this, Math.floor(Math.random() * 3) , CANVAS.clientWidth - 50, CANVAS.height - SPAWN_OFFSET);
                break;
            case 2:
                new PoleFactory(this, Math.floor(Math.random() * 3) , CANVAS.clientWidth - 50, CANVAS.height - SPAWN_OFFSET);
                break;
            default:
                new PoleFactory(this, 1, CANVAS.clientWidth - 50, CANVAS.height - SPAWN_OFFSET);
                break;
        }
    }

    /**
     * Sets the speed of the room/game.
     * @param {number} value The speed.
     */
    setSpeedH(value) {
        this.speedH = value;
        this.background1.speedH = this.speedH / 4;
        this.background2.speedH = this.speedH / 20;

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

        CTX.fillText(`S${-this.speedH.toFixed(1)}`, 160, fontSize + 10);
        CTX.strokeText(`S${-this.speedH.toFixed(2)}`, 160, fontSize + 10);

        CTX.fillText(`FPS${parseInt(MainLoop.getFPS())}`, 310, fontSize + 10);
        CTX.strokeText(`FPS${parseInt(MainLoop.getFPS())}`, 310, fontSize + 10);

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
     * TODO: Score's, menu's 'n stuff...
     */
    end() {
        this.setSpeedH(0);
        this.screenMessage1 = 'Game over';
        this.screenMessage2Timeout = setTimeout(() => {
            this.screenMessage2 = "Tap to restart"
            CANVAS.addEventListener('click', this.restart.bind(this));
            CANVAS.addEventListener('touchstart', this.restart.bind(this));
        }, 600)
    }

    restart() {
        clearTimeout(this.screenMessage2Timeout);

        if (this.screenMessage1) {
            this.constructor();
        }
    }
}