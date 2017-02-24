import BEM from 'bem.js';
import MainLoop from 'mainloop.js';
import { CANVAS, CTX } from './canvas';
import { FallingBLock, EnemyEasy, PoleFactory } from './enemies';
import { GameSprite, GameBackground, GameRoom } from './gameclasses';
import { SPRITE_PLATFORM, SPRITE_PLATFORM_TOP, PLATORM_BUFFER, PlatformBlock, PlatformBlockTop } from './platform';
import { Player } from './player';


/** {HTMLImageElement} representing the blue background. */
const ASSET_BACKGROUND_BLUE = BEM.getBEMNode('background', false, 'blue');

/** {HTMLImageElement} representing the green background. */
const ASSET_BACKGROUND_GREEN = BEM.getBEMNode('background', false, 'green');

/** {HTMLImageElement} representing the gray background. */
const ASSET_BACKGROUND_GRAY = BEM.getBEMNode('background', false, 'gray');

/** {GameSprite} representing the blue background. */
const BACKGROUND_BLUE = new GameBackground([ASSET_BACKGROUND_BLUE]);

/** {GameSprite} representing the green background. */
const BACKGROUND_GREEN = new GameBackground([ASSET_BACKGROUND_GREEN]);

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
        this.score = 0;
        this.level = 1;
        this.background = BACKGROUND_BLUE;
        
        this.setSpeedH(-5);
        this.createFloor();
        this.createInitialObjects();
    }

    draw() {
        this.background.draw();
        this.objects.forEach((object) => object.draw());
        this.drawHud();
    }


    /**
     * Update the state of this object.
     * Gets fired by MainLoop.
     */
    update() {
        this.level = Math.ceil(this.score / 1000);
        this.score++;
        this.objects.forEach((object) => object.update());
        this.background.update();
        this.removeObjectsOutsideRoom();
        this.updateEnemies(this.score);
    }

    createFloor() {
        let h = SPRITE_PLATFORM.height;
        let y = CANVAS.clientHeight - SPRITE_PLATFORM.originY;
        let y2 = y - SPRITE_PLATFORM_TOP.height;
        this.createPlatform(PlatformBlock, 0, y, CANVAS.width / SPRITE_PLATFORM.width + PLATORM_BUFFER);
        this.createPlatform(PlatformBlockTop, 0, y2, CANVAS.width / SPRITE_PLATFORM_TOP.width + PLATORM_BUFFER);
    }

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
            return object.y < CANVAS.clientHeight;
        });
    }

    /**
     * Adds enemeis (if needed)
     */
    updateEnemies() {
        let interval = 200;
        // return;
        if (this.score % interval !== 0) {
            return;
        }

        this.level = Math.min(this.level, 3)
        this.setSpeedH(Math.max(this.speedH - 0.1, MAX_SPEEDH));

        switch(this.level) {
            case 3:
                let rand = Math.random();
                if (rand > 0.50) {
                    if (rand > 0.75) { this.createObject(FallingBLock, Math.random() * CANVAS.clientWidth, CANVAS.height - SPAWN_OFFSET); }
                    else { this.createObject(EnemyEasy, Math.random() * CANVAS.clientWidth, CANVAS.height - SPAWN_OFFSET); }
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

    setSpeedH(value) {
        this.speedH = value;
        this.background.speedH = this.speedH / 4;

        let objects = this.objects.forEach((object) => {
            if (object.constructor.name === PlatformBlock.name ||
                object.constructor.name === PlatformBlockTop.name) {
                    object.speedH = value;
                }
        });

    }

    drawHud() {
        let fontSize = 30;
        CTX.font=`${fontSize}px pressstart`;
        CTX.fillStyle='#FFF';
        CTX.strokeStyle='#000';

        CTX.textAlign='start';
        CTX.fillText(`L${this.level}`, 10, fontSize + 10);
        CTX.strokeText(`L${this.level}`, 10, fontSize + 10);

        CTX.fillText(`S${-this.speedH.toFixed(1)}`, 150, fontSize + 10);
        CTX.strokeText(`S${-this.speedH.toFixed(2)}`, 150, fontSize + 10);

        CTX.textAlign='end';
        CTX.fillText(`${this.score}`, CANVAS.clientWidth - 10, fontSize + 10);
        CTX.strokeText(`${this.score}`, CANVAS.clientWidth - 10, fontSize + 10);
    }

    /**
     * Stops the room.
     * TODO: Score's, menu's 'n stuff...
     */
    end() {
        this.background.speedH = 0;
        MainLoop.stop();
    }
}