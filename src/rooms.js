import BEM from 'bem.js';
import { GameSprite, GameRoom } from './gameclasses';
import { SPRITE_PLATFORM, SPRITE_PLATFORM_TOP, PlatformBlock, PlatformBlockTop } from './platform';
import { Player } from './player';
import { CANVAS, CTX } from './canvas';

/** {number} Amount of platform blocks to render ahead. */
const VIEWPORT_BUFFER = 1;

/** {HTMLImageElement} representing the blue background. */
const ASSET_BACKGROUND_BLUE = BEM.getBEMNode('background', false, 'blue');

/** {HTMLImageElement} representing the green background. */
const ASSET_BACKGROUND_GREEN = BEM.getBEMNode('background', false, 'green');

/** {HTMLImageElement} representing the gray background. */
const ASSET_BACKGROUND_GRAY = BEM.getBEMNode('background', false, 'gray');

/** {GameSprite} representing the blue background. */
const SPRITE_BACKGROUND_BLUE = new GameSprite([ASSET_BACKGROUND_BLUE]);

/** {GameSprite} representing the green background. */
const SPRITE_BACKGROUND_GREEN = new GameSprite([ASSET_BACKGROUND_GREEN]);

/** {GameSprite} representing the gray background. */
const SPRITE_BACKGROUND_GRAY = new GameSprite([ASSET_BACKGROUND_GRAY]);


/**
 * The playable level.
 * @class
 */
export class Level extends GameRoom {
    constructor() {
        super();
        this.speed = 5;
        
        this.createFloor();
        this.createPlayer();
    }

    draw() {
        this.drawSky();
        this.objects.forEach((object) => object.draw());
    }

    update() {
        this.objects.forEach((object) => object.update());
        let nonPlayerObjects = this.objects.filter((object) => object.constructor.name !== Player.name);
        nonPlayerObjects.forEach((object) => object.x -= this.speed);
        
        let outsideGameRoomObjects = nonPlayerObjects.filter((object) => !object.isInsideGameRoom() && object.x <= 0);
        outsideGameRoomObjects.forEach((object) => object.x += CANVAS.width + VIEWPORT_BUFFER * object.sprite.width);
    }

    drawSky() {
        let grd = CTX.createLinearGradient(0, 0, 0, 100);
        grd.addColorStop(0, '#3a7bd5');
        grd.addColorStop(1, '#00d2ff');

        CTX.fillStyle = grd;
        CTX.fillRect(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);

        CTX.drawImage(SPRITE_BACKGROUND_BLUE.image, 0, 0, CANVAS.clientWidth, CANVAS.clientHeight);
    }

    createFloor() {
        let h = SPRITE_PLATFORM.height;
        let y = CANVAS.clientHeight - h;
        let y2 = y - SPRITE_PLATFORM_TOP.height;
        this.createPlatform(PlatformBlock, 0, y, CANVAS.width / SPRITE_PLATFORM.width + VIEWPORT_BUFFER);
        this.createPlatform(PlatformBlockTop, 0, y2, CANVAS.width / SPRITE_PLATFORM_TOP.width + VIEWPORT_BUFFER);
    }

    createPlatform(gameObjectClass, x, y, n) {
        for (let i=0; i<n; i++) {
            let gameObject = new gameObjectClass(this);
            gameObject.x = i * gameObject.sprite.width + x;
            gameObject.y = y;
            this.objects.push(gameObject);
        }
    }

    createPlayer() {
        let player = new Player(this);
        player.x = 10;
        player.y = 10;

        this.objects.push(player);
    }
}