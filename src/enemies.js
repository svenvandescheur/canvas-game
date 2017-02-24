import BEM from 'bem.js';
import { CANVAS, CTX } from './canvas';
import { GameSprite, GravitatingGameObject } from './gameclasses';
import { Player} from './player';


/** {HTMLImageElement} representing the falling block. */
const ASSET_FALLING_BLOCK = BEM.getBEMNode('block', false, 'falling');

/** {GameSprite} representing the the falling block. */
const SPRITE_FALLING_BLOCK = new GameSprite([ASSET_FALLING_BLOCK]);

/** {HTMLImageElement} representing the easy enemy. */
const ASSET_ENEMY_EASY = BEM.getBEMNode('enemy', false, 'easy');

/** {GameSprite} representing the the easy enemy. */
const SPRITE_ENEMY_EASY = new GameSprite([ASSET_ENEMY_EASY]);

/** {HTMLImageElement} representing the pole. */
const ASSET_POLE = BEM.getBEMNode('pole');

/** {GameSprite} representing the the pole. */
const SPRITE_POLE = new GameSprite([ASSET_POLE]);

/** {HTMLImageElement} representing the pole top. */
const ASSET_POLE_TOP = BEM.getBEMNode('pole', false, 'top');

/** {GameSprite} representing the the pole top. */
const SPRITE_POLE_TOP = new GameSprite([ASSET_POLE_TOP]);


/**
 * A generic enemy.
 * @abstract
 */
class Enemy extends GravitatingGameObject {
    /**
     * Update the state of this object.
     * Gets fired by MainLoop.
     */
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
 * A generic "delayed" enemy..
 * @abstract
 */
class DelayedEnemy extends Enemy {
    /**
     * Constructor method.
     * @param {GameRoom} gameRoom
     * @param {GameSprite} gameSprite
     */
    constructor(gameRoom, GameSprite) {
        super(gameRoom, GameSprite)
        this.lifeTime = 0;
        this.delayTimePassed = false;
    }

    /**
     * Update the state of this object.
     * Gets fired by MainLoop.
     */
    update() {
        let y = this.y;
        super.update();

        if (this.lifeTime < 60) {
            this.y = y;
        } else {
            this.delayTimePassed = true;
        }

        this.lifeTime++;
    }
}


/**
 * A simple falling block enemy.
 * @class
 */
export class FallingBLock extends DelayedEnemy {
    /**
     * Constructor method.
     * @param {GameRoom} gameRoom
     * @param {GameSprite} gameSprite
     */
    constructor(gameRoom) {
        super(gameRoom, SPRITE_FALLING_BLOCK)
        this.lifeTime = 0;
    }
}


/**
 * A simple falling block enemy.
 * @class
 */
export class EnemyEasy extends DelayedEnemy {
    /**
     * Constructor method.
     * @param {GameRoom} gameRoom
     * @param {GameSprite} gameSprite
     */
    constructor(gameRoom) {
        super(gameRoom, SPRITE_ENEMY_EASY)
    }

    /**
     * Update the state of this object.
     * Gets fired by MainLoop.
     */
    update() {
        super.update();
        
        if (this.delayTimePassed) {
            this.speedH = -this.frictionSpeed + 1;
        }
    }
}


/**
 * Exposes a constructor creating Pole & PoleTop objects.
 * @class
 */
export class PoleFactory {
    /**
     * Constructor method.
     * @param {GameRoom} gameRoom
     * @param {number} levels Amount of (non top) poles..
     */
    constructor(gameRoom, levels, x, y) {
        for (let i=0; i<levels; i++) {
            let pole = new Pole(gameRoom);
            pole.x = x;
            pole.y = y - i * SPRITE_POLE.height;
            gameRoom.objects.push(pole);
        }
        let poleTop = new PoleTop(gameRoom);
        poleTop.x = x;
        poleTop.y = y - levels * SPRITE_POLE.height;
        gameRoom.objects.push(poleTop);
    }
}


/**
 * A generic pole.
 */
class AbstractPole extends Enemy {
    /**
     * Update the state of this object.
     * Gets fired by MainLoop.
     */
    update() {
        super.update();
        let object = this.room.findNearestGameObjectBelowPoint(this.x, this.y, this);

        if (!object ) {
            return;
        }
        
        if (object.constructor.name === Pole.name || object.constructor.name === PoleTop.name) {
            this.x = object.x;
        }
    }
}


/**
 * A simple falling block enemy.
 * @class
 */
export class Pole extends AbstractPole {
    /**
     * Constructor method.
     * @param {GameRoom} gameRoom
     * @param {GameSprite} gameSprite
     */
    constructor(gameRoom) {
        super(gameRoom, SPRITE_POLE)
    }
}


/**
 * A simple falling block enemy.
 * @class
 */
export class PoleTop extends AbstractPole {
    /**
     * Constructor method.
     * @param {GameRoom} gameRoom
     * @param {GameSprite} gameSprite
     */
    constructor(gameRoom) {
        super(gameRoom, SPRITE_POLE_TOP)
    }
}