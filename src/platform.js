import BEM from 'bem.js';
import { CANVAS } from './canvas';
import { GameSprite, GameObject } from './gameclasses';


/** {HTMLImageElement} representing the platform block. */
const ASSET_PLATFORM = BEM.getBEMNode('platform');

/** {GameSprite} representing the the platform block. */
export const SPRITE_PLATFORM = new GameSprite([ASSET_PLATFORM]);

/** {HTMLImageElement} representing the platform block top. */
const ASSET_PLATFORM_TOP = BEM.getBEMNode('platform', false, 'top')

/** {GameSprite} representing the the platform block top. */
export const SPRITE_PLATFORM_TOP = new GameSprite([ASSET_PLATFORM_TOP]);

/** {number} Amount of platform blocks to render ahead. */
export const PLATORM_BUFFER = 1;


/**
 * Exposes a constructor creating Pole & PoleTop objects.
 * @class
 */
export class PlatformFactory {
    /**
     * Creates a platform.
     * @param {GameRoom} gameRoom
     * @param {number} x.
     * @param {number} y.
     * @param {number} n.
     */
    create(gameRoom, x, y, n) {
        for (let i=0; i<n; i++) {
            let xx = SPRITE_PLATFORM.width * i + x;

            let platformBlockTop = new PlatformBlockTop(gameRoom);
            platformBlockTop.x = xx;
            platformBlockTop.y = y;

            let platformBlock = new PlatformBlock(gameRoom);
            platformBlock.x = xx;
            platformBlock.y = y + platformBlockTop.sprite.height;
            
            
            gameRoom.objects.push(platformBlockTop);
            gameRoom.objects.push(platformBlock);
        }
    }
}



/**
 * Base class for platform object.
 * @abstract
 */
class AbstractPlatformObject extends GameObject {
    /**
     * Constructor method.
     * @param {GameRoom} gameRoom
     * @param {GameSprite} gameSprite
     */
    constructor(gameRoom, gameSprite) {
        super(gameRoom, gameSprite)
        this.speedH = 0;
    }

    /**
     * Update the state of this object.
     * Gets fired by MainLoop.
     */
    update(delta) {
        super.update(delta);        
        if (this.isOutsideRoom()) {
            this.x += CANVAS.clientWidth + PLATORM_BUFFER * this.sprite.width;
        }
    }
}


/**
 * A block as part of the floor or platform.
 * @class
 */
export class PlatformBlock extends AbstractPlatformObject {
    /**
     * Constructor method.
     * @param {GameRoom} gameRoom
     */
    constructor(gameRoom) {
        super(gameRoom, SPRITE_PLATFORM);
    }
}


/**
 * The top layer as part of the floor or platform.
 * @class
 */
export class PlatformBlockTop extends AbstractPlatformObject {
    /**
     * Constructor method.
     * @param {GameRoom} gameRoom
     */
    constructor(gameRoom) {
        super(gameRoom, SPRITE_PLATFORM_TOP)
    }
}