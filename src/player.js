import BEM from 'bem.js';
import { CANVAS, CTX } from './canvas';
import { GameSprite, GravitatingGameObject } from './gameclasses';


/** {HTMLImageElement} representing player image 1. */
const ASSET_PLAYER1 = BEM.getBEMNode('player1');

/** {HTMLImageElement} representing player image 2. */
const ASSET_PLAYER2 = BEM.getBEMNode('player2');

/** {HTMLImageElement} representing player image 3. */
const ASSET_PLAYER3 = BEM.getBEMNode('player3');

/** {HTMLImageElement} representing player image 4. */
const ASSET_PLAYER4 = BEM.getBEMNode('player4');

/** {GameSprite} representing the player. */
const SPRITE_PLAYER = new GameSprite([ASSET_PLAYER1, ASSET_PLAYER2, ASSET_PLAYER3, ASSET_PLAYER4]);


export class Player extends GravitatingGameObject {
    constructor(gameRoom) {
        super(gameRoom, SPRITE_PLAYER);
        this.alive = true;
        this.jumpStartTime = null;
        this.moveX = null;

        this.setUpControls();
    }

    setUpControls() {
        CANVAS.addEventListener('mousedown', this.touchStart.bind(this));
        CANVAS.addEventListener('mousemove', this.tochMove.bind(this));
        CANVAS.addEventListener('mouseup', this.touchEnd.bind(this));
        CANVAS.addEventListener('touchstart', this.touchStart.bind(this));
        CANVAS.addEventListener('touchmove', this.tochMove.bind(this));
        CANVAS.addEventListener('touchend', this.touchEnd.bind(this));
    }

    touchStart(e) {
        e.preventDefault();

        // Jump
        let date = new Date();
        this.jumpStartTime = date.getTime();
    }

    tochMove(e) {
        e.preventDefault();

        // Move
        let inputX = (e.touches) ? e.touches[0].clientX : e.clientX;
        this.moveX = Math.min(inputX, CANVAS.clientWidth - this.sprite.width);
    }

    touchEnd(e) {
        e.preventDefault();
        
        // Jump
        let date = new Date();
        let time = date.getTime();

        if (!this.isAirborne() && this.jumpStartTime) {
            let velocity = Math.min((time - this.jumpStartTime) / 4, 27)

            if (time - this.jumpStartTime <= 500) {
                this.gravitySpeed = -velocity;
                this.speedH = this.speedH /2
            }
            
            this.jumpStartTime = null;
        }
    }

    update(delta) {
        super.update(delta);
        this.delta = delta;

        this.sprite.skipFrames = 10 - Math.abs(this.speedH);

        if (!this.isAirborne() && this.alive) {
            let distance = this.moveX - this.x
            let distanceSpeed = distance / 30;
            this.speedH = -this.frictionSpeed + distanceSpeed;
        }

        if (this.x - this.sprite.originX <= 0) {
            this.speedH = Math.max(this.speedH, 0);
            this.frictionSpeed = 0;
            this.x = this.sprite.originX * delta;
        }

        if (this.x - this.sprite.originX + this.sprite.width >= CANVAS.clientWidth) {
            this.speedH = Math.min(this.speedH, 0);
        }
    }

    /**
     * Trigger game over, player dies.
     */
    die() {
        this.alive = false;
        this.speedH = 0;
        this.room.end();
    }
}