import BEM from 'bem.js';
import { GameSprite, GameObject } from './gameclasses';


/** {HTMLImageElement} representing the platform block. */
const ASSET_PLATFORM = BEM.getBEMNode('platform');

/** {GameSprite} representing the the platform block. */
export const SPRITE_PLATFORM = new GameSprite([ASSET_PLATFORM]);

/** {HTMLImageElement} representing the platform block top. */
const ASSET_PLATFORM_TOP = BEM.getBEMNode('platform', false, 'top')

/** {GameSprite} representing the the platform block top. */
export const SPRITE_PLATFORM_TOP = new GameSprite([ASSET_PLATFORM_TOP]);


/**
 * A block as part of the floor or platform.
 * @class
 */
export class PlatformBlock extends GameObject {
    constructor(gameRoom) {
        super(gameRoom, SPRITE_PLATFORM)
    }
}


/**
 * The top layer as part of the floor or platform.
 * @class
 */
export class PlatformBlockTop extends GameObject {
    constructor(gameRoom) {
        super(gameRoom, SPRITE_PLATFORM_TOP)
    }
}