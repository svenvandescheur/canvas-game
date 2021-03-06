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
        this.imageDimensions = [];
        this.image = null;
        this.images = images;
        this.imageIndex = 0;
        this.skipFrames = 3;
        this.skippedFrames = 0;

        this.images.forEach((image) => {
            let imageObject = new Image();
            imageObject.onload = () => {
                this.imageDimensions.push({ width: imageObject.width, height: imageObject.height });
                this.width = imageObject.width;
                this.height = imageObject.height;
            }
            imageObject.onerror = (e) => { console.error(e); }
            imageObject.src = image.src;
        });

        this.updateImage(1, true);
    }

    /**
     * Update the state of this sprite.
     * Gets fired by MainLoop.
     */
    update(delta) {
        this.updateImage(delta);
    }

    /**
     * Loads the next image if time since last update > this.imageSpeed.
     * @param {boolean} [force=false]
     */
    updateImage(delta, force=false) {
        let date = new Date();
        let time = date.getTime();

        if ((this.animate && this.skippedFrames >= this.skipFrames) || force) {
            this.skippedFrames = 0;
            this.imageIndex = (this.imageIndex + 1 >= this.images.length) ? 0 : this.imageIndex + 1;
            this.image = this.images[this.imageIndex];

            let dimensions = this.imageDimensions[this.imageIndex];
            if (dimensions) {
                this.width = dimensions.width;
                this.height = dimensions.height;
            }
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
     * Update the state of this sprite.
     * Gets fired by MainLoop.
     */
    update(delta) {
        super.update(delta);
        this.originX = this.width / 2;
        this.originY = this.height / 2;
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
        this.y = 0;
        this.speedH = 0;
    }

    /**
     * Update the state of this sprite.
     * Gets fired by MainLoop.
     */
    update(delta) {
        super.update(delta);
        this.x += Math.round(this.speedH);

        if(this.isOutsideRoomLeft()) {
            this.x += Math.round(this.width);
        }
    }

    /**
     * Returns whether this object is outside the room/canvas. 
     * @returns {boolean}
     */
    isOutsideRoomLeft() {
        return this.x + this.width < 0;
    }

    /**
     * Draws the sprite of this object on CTX.
     * Gets fired by MainLoop.
     */
    draw() {
        for (let i=0; i+this.width < CANVAS.clientWidth; i++) {
            let x = Math.round(this.x + i * this.width);
            let y = Math.round(this.y);
            let w = Math.round(this.width);
            let h = Math.round(this.height);

            CTX.drawImage(this.image, x, y, w, h);
        }
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
        this.weight = 10;
    }

    /**
     * Draws the sprite of this object on CTX.
     * Gets fired by MainLoop.
     */
    draw() {
        if (this.isOutsideRoom()) {
            return;
        }

        let x = Math.round(this.x - this.sprite.originX);
        let y = Math.round(this.y - this.sprite.originY);
        let w = Math.round(this.sprite.width);
        let h = Math.round(this.sprite.height);

        CTX.drawImage(this.sprite.image, x, y, w, h);
    }

    /**
     * Update the state of this object.
     * Gets fired by MainLoop.
     */
    update(delta) {
        this.sprite.update(delta);
        
        if (this.speedH) {
            this.x += Math.round(this.speedH * delta);
        };

        if (this.speedV) {
            this.y += Math.round(this.speedV * delta);
        };

        this.checkCollisionBelow();
    };

    /**
     * Checks if there is a collision below.
     * Fires this.collisionBelow() is fo.
     */
    checkCollisionBelow() {
        let other = this.room.findNearestGameObjectBelowPoint(this.x, this.y - this.sprite.originY + this.sprite.height + 1);
        if (other) {
            if (other.isAtPosition(this.x, this.y - this.sprite.originY + this.sprite.height + 1)) {
                this.collisionBelow(other);
            }
        }
    }

    /**
     * Logic to call when there is a collision below this object.
     * @param {GameObject} other.
     */
    collisionBelow(other) {
    }

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
    update(delta) {
        super.update(delta);
        this.checkCollisionBelow();

        this.applyGravity(delta);
        this.applyFriction(delta);
        this.y += Math.round(this.gravitySpeed * delta);
        this.x += Math.round(this.frictionSpeed * delta);
    }

    /**
     * Controls friction parameters.
     */
    applyFriction(delta) {
        if (!this.isAirborne()) {
            let floor = this.room.findNearestGameObjectBelowPoint(this.x, this.y - this.sprite.originY + this.sprite.height, this);
            if (floor) {
                this.frictionSpeed = floor.frictionSpeed || floor.speedH;
            }
        } else {
            this.frictionSpeed = 0;
        }
    }

    /**
     * Controls gravitation parameters.
     * Calls this.land() if not falling/bouncing.
     */
    applyGravity(delta) {
        if (this.isAirborne()) {
            // this.speedH = 0;
            this.gravitySpeed += 1.5 * delta;
        } else {
            if (this.gravitySpeed && Math.abs(this.gravitySpeed) < 3) {
                this.land(delta);            
            } else {
                this.gravitySpeed = this.gravitySpeed * -0.25;
            }
        }
    }

    /**
     * Stops gravitating, snaps to the floor.
     */
    land(delta) {
        let target = this.y - this.sprite.originY + this.sprite.height + 1 * delta;
        let object = this.room.findNearestGameObjectBelowPoint(this.x, target, this);
        
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
        return !objects.find((object) => object.isAtPosition(this.x, this.y - this.sprite.originY + this.sprite.height + (this.gravitySpeed || 1)))
    }

    /**
     * Checks if there is a collision below.
     */
    checkCollisionBelow() {
        let other = this.room.findNearestGameObjectBelowPoint(this.x, this.y - this.sprite.originY + this.sprite.height + 1);
        if (other) {
            if (other.isAtPosition(this.x, this.y - this.sprite.originY + this.sprite.height + 1)) {
                this.collisionBelow(other);
            }
        }
    }
}

/**
 * A room/view (level, menu).
 * @abstract
 */
export class GameRoom {
    /**
     * Constructor method.
     */
    constructor() {
        this.objects = [];

        MainLoop.setDraw(this.draw.bind(this));
        MainLoop.setUpdate(this.update.bind(this));
        MainLoop.start();
    }

    draw() {}

    update(delta) {}

    findNearestGameObjectBelowPoint(x, y, notMe) {
        let objects = this.objects.filter((object) => object !== notMe);

        for (y=y+1; y<=CANVAS.height; y++) {
            let object = objects.find(object => object.isAtPosition(x, y));
            
            if (object) {
                return object;
            }
        }
    }
}