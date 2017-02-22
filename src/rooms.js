import BEM from 'bem.js';
import { GameSprite, GameBackground, GameRoom } from './gameclasses';
import { SPRITE_PLATFORM, SPRITE_PLATFORM_TOP, PLATORM_BUFFER, PlatformBlock, PlatformBlockTop } from './platform';
import { Player } from './player';
import { CANVAS, CTX } from './canvas';


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


/**
 * The playable level.
 * @class
 */
export class Level extends GameRoom {
    constructor() {
        super();
        this.speedH = -5;
        this.background = BACKGROUND_BLUE;
        this.background.speedH = this.speedH / 4;
        
        this.createFloor();
        this.createPlayer();
    }

    draw() {
        this.drawSky();
        this.objects.forEach((object) => object.draw());
    }

    update() {
        this.objects.forEach((object) => object.update());
        this.background.update();
    }

    drawSky() {
        CTX.drawImage(this.background.image, this.background.x, 0, CANVAS.clientWidth, CANVAS.clientHeight);
        CTX.drawImage(this.background.image, this.background.x + CANVAS.clientWidth, 0, CANVAS.clientWidth, CANVAS.clientHeight);
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

    createPlayer() {
        let player = new Player(this);
        player.x = 70;
        player.y = 10;

        this.objects.push(player);
    }
}