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
        this.animate = true;
        this.image = null;
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

        if ((this.animate && this.skippedFrames >= this.skipFrames) || force) {
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
export class GameSprite extends AbstractGameImage {
    /**
     * Constructor method.
     * @param {Array} array of canvas image resources.
     */
    constructor(images) {
        super(images);
        setTimeout(() => {
            this.originX = this.width / 2;
            this.originY = this.height / 2;
        })
    }
}


/**
 * Represents a sprite (a game image).
 * @class
 */
export class GameBackground extends AbstractGameImage {
    /**
     * Constructor method.
     * @param {Array} array of canvas image resources.
     */
    constructor(images) {
        super(images);
        this.x = 0;
        this.speedH = 0;
    }

    /**
     * Update the state of this sprite.
     * Gets fired by MainLoop.
     */
    update() {
        super.update();
        this.x += this.speedH;

        if(this.isOutsideRoomLeft()) {
            this.x += CANVAS.clientWidth;
        }
    }

    /**
     * Returns whether this object is outside the room/canvas. 
     * @returns {boolean}
     */
    isOutsideRoomLeft() {
        return this.x + CANVAS.clientWidth < 0;
    }
}


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
        this.room = gameRoom;
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
            this.x - this.sprite.originX,
            this.y - this.sprite.originY,
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
        let isAtX = (x >= this.x - this.sprite.originX && x <= this.x - this.sprite.originX + this.sprite.width);
        let isAtY = (y >= this.y - this.sprite.originY && y <= this.y - this.sprite.originY + this.sprite.height);
        return isAtX && isAtY;
    }

    /**
     * Returns whether this object is outside the room/canvas. 
     * @returns {boolean}
     */
    isOutsideRoom() {
        let isOutsideX = (this.x - this.sprite.originX + this.sprite.width < 0 || this.x - this.sprite.originX > CANVAS.width);
        let isOutsideY = (this.y - this.sprite.originY > CANVAS.height || this.y - this.sprite.originY + this.sprite.height < 0);
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
        this.frictionSpeed = 0;
        this.gravitySpeed = 1;
    }

    /**
     * Update the state of this object.
     * Gets fired by MainLoop.
     */
    update() {
        super.update();
        this.applyGravity();
        this.applyFriction();
        this.y += this.gravitySpeed;
        this.x += this.frictionSpeed;
    }

    applyFriction() {
        if (!this.isAirborne()) {
            let floor = this.room.findNearestGameObjectBelowPoint(this.x, this.y, this);
            if (floor) {
                this.frictionSpeed = floor.speedH;
            }
        } else {
            this.frictionSpeed = 0;
        }
    }

    /**
     * Controls gravitation parameters.
     * Calls this.land() if not falling/bouncing.
     */
    applyGravity() {
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
        let object = this.room.findNearestGameObjectBelowPoint(this.x, this.y, this);
        
        if (object) {
            let objectTop = object.y - object.sprite.originY;
            this.y = objectTop - this.sprite.originY
        }

        this.gravitySpeed = 0;
    }

    /**
     * Returns wheter this object is in airbone (no contact with an object below).
     * @param {boolean}
     */
    isAirborne() {
        let objects = this.room.objects.filter((object) => object !== this);
        return !objects.find((object) => object.isAtPosition(this.x, this.y - this.sprite.originY + this.sprite.height + this.gravitySpeed))
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

    end() {}
}