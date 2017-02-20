import MainLoop from 'mainloop.js';
import { CANVAS, CTX } from './canvas';


/**
 *  Base class for sprites and bakcground.
 * @abstract
 */
class AbstractGameImage {
    /**
     * Constructor method.
     * @param {Array} array of canvas image resources.
     */
    constructor(images) {
        this.images = images;
        this.imageIndex = 0;
        this.skipFrames = 3;
        this.skippedFrames = 0;
        this.updateImage(true);
    }

    /**
     * Update the state of this sprite.
     * Gets fired by MainLoop.
     */
    update() {
        this.updateImage();
    }

    /**
     * Loads the next image if time since last update > this.imageSpeed.
     * @param {boolean} [force=false]
     */
    updateImage(force=false) {
        let date = new Date();
        let time = date.getTime();

        if (this.skippedFrames >= this.skipFrames || force) {
            this.skippedFrames = 0;

            this.imageIndex = (this.imageIndex + 1 >= this.images.length) ? 0 : this.imageIndex + 1;
            this.image = this.images[this.imageIndex];

            let img = new Image();

            img.onload = () => {
                this.width = img.width;
                this.height = img.height;
            }

            img.src = this.images[this.imageIndex].src;
        } else {
            this.skippedFrames++;
        }
    }
}

/**
 * Represents a sprite (a game image).
 * @class
 */
export class GameSprite extends AbstractGameImage {}


/**
 * Represents an object in the game (player, platform block etc.).
 * @abstract
 */
export class GameObject {
    /**
     * Constructor method.
     * @param {GameRoom} gameRoom
     * @param {GameSprite} sprite
     */
    constructor(gameRoom, sprite) {
        this.sprite = sprite;
        this.x = 0;
        this.y = 0;
        this.speedH = 0;
        this.speedV = 0;
    }

    /**
     * Draws the sprite of this object on CTX.
     * Gets fired by MainLoop.
     */
    draw() {
        CTX.drawImage(this.sprite.image,
            this.x,
            this.y,
            this.sprite.width,
            this.sprite.height)
    }

    /**
     * Update the state of this object.
     * Gets fired by MainLoop.
     */
    update() {
        this.sprite.update();
        
        if (this.speedH) {
            this.x += this.speedH;
        };

        if (this.speedV) {
            this.y += this.speedV;
        };
    };

    /**
     * Returns whether this object's bounding box is present at x, y coordinates.
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    isAtPosition(x, y) {
        let isAtX = (x >= this.x && x <= this.x + this.sprite.width);
        let isAtY = (y >= this.y && y <= this.y + this.sprite.height);
        return isAtX && isAtY;
    }

    /**
     * Returns whether this object is outside the room/canvas. 
     * @returns {boolean}
     */
    isOutsideRoom() {
        let isOutsideX = (this.x + this.sprite.width < 0 || this.x > CANVAS.width);
        let isOutsideY = (this.y > CANVAS.height || this.y + this.sprite.height < 0);
        return isOutsideX || isOutsideY;
    }
}


/**
 * A game object that is affected by gravity.
 * @abstract
 */
export class GravitatingGameObject extends GameObject {
    /**
     * Constructor method.
     * @param {GameRoom} gameRoom
     * @param {GameSprite} sprite
     */
    constructor(gameRoom, sprite) {
        super(gameRoom, sprite);
        this.gameRoom = gameRoom;
        this.gravitySpeed = 1;
    }

    /**
     * Update the state of this object.
     * Gets fired by MainLoop.
     */
    update() {
        super.update();
        this.gravitate();
        this.y += this.gravitySpeed;
    }

    /**
     * Controls gravitation parameters.
     * Calls this.land() if not falling/bouncing.
     */
    gravitate() {
        if (this.isAirborne()) {
            this.gravitySpeed++;
        } else {
            if (Math.abs(this.gravitySpeed) < 3) {
                this.land();            
            } else {
                this.gravitySpeed = this.gravitySpeed * -0.25;
            }
        }
    }

    /**
     * Stops gravitating, snaps to the floor.
     */
    land() {
        let object = this.gameRoom.findNearestGameObjectBelowPoint(this.x, this.y, this);
        
        if (object) {
            this.y = object.y - this.sprite.height;
        }

        this.gravitySpeed = 0;
    }

    /**
     * Returns wheter this object is in airbone (no contact with an object below).
     * @param {boolean}
     */
    isAirborne() {
        let objects = this.gameRoom.objects.filter((object) => object !== this);
        return !objects.find((object) => object.isAtPosition(this.x, this.y + this.sprite.height + this.gravitySpeed))
    }
}

/**
 * A room/view (level, menu).
 * @abstract
 */
export class GameRoom {
    constructor() {
        this.objects = [];

        MainLoop.setDraw(this.draw.bind(this));
        MainLoop.setUpdate(this.update.bind(this));
        MainLoop.start();
    }

    draw() {}

    update() {}

    findNearestGameObjectBelowPoint(x, y, notMe) {
        let objects = this.objects.filter((object) => object !== notMe);

        for (y=y; y<=CANVAS.height; y++) {
            let object = objects.find(object => object.isAtPosition(x, y));
            
            if (object) {
                return object;
            }
        }
    }
}