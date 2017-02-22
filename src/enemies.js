import BEM from 'bem.js';
import { CANVAS, CTX } from './canvas';
import { GameSprite, GravitatingGameObject } from './gameclasses';
import { Player} from './player';


/** {HTMLImageElement} representing the falling block. */
const ASSET_FALLING_BLOCK = BEM.getBEMNode('block', false, 'falling');

/** {GameSprite} representing the the falling block. */
const SPRITE_FALLING_BLOCK = new GameSprite([ASSET_FALLING_BLOCK]);

/** {HTMLImageElement} representing the enemy. */
const ASSET_ENEMY_EASY = BEM.getBEMNode('enemy', false, 'easy');

/** {GameSprite} representing the the enemy. */
const SPRITE_ENEMY_EASY = new GameSprite([ASSET_ENEMY_EASY]);


/**
 * A generic enemy.
 */
class Enemy extends GravitatingGameObject {
    update() {
        super.update();
        
        let player = this.room.objects.find((object) => object.constructor.name === Player.name);
        // let playerAtTL = player.isAtPosition(this.x - this.sprite.originX, this.y - this.sprite.originY);
        // let playerAtTR = player.isAtPosition(this.x - this.sprite.originX + this.sprite.width, this.y - this.sprite.originY);
        let playerAtBL = player.isAtPosition(this.x - this.sprite.originX, this.y - this.sprite.originY + this.sprite.height);
        let playerAtBR = player.isAtPosition(this.x - this.sprite.originX + this.sprite.width, this.y - this.sprite.originY + this.sprite.height);

        if (playerAtBL || playerAtBR) {
            player.die();  // So sorry...
        }    

        if (this.isOutsideRoom()) {
            // Delete?
        }
    }
}

/**
 * A simple falling block enemy.
 * @class
 */
export class FallingBLock extends Enemy {
    /**
     * Constructor method.
     * @param {GameRoom} gameRoom
     * @param {GameSprite} gameSprite
     */
    constructor(gameRoom) {
        super(gameRoom, SPRITE_FALLING_BLOCK)
    }
}

/**
 * A simple falling block enemy.
 * @class
 */
export class EnemyEasy extends Enemy {
    /**
     * Constructor method.
     * @param {GameRoom} gameRoom
     * @param {GameSprite} gameSprite
     */
    constructor(gameRoom) {
        super(gameRoom, SPRITE_ENEMY_EASY)
        this.speedH = Math.random() * 5;
    }
}