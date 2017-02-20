import MainLoop from 'mainloop.js';
import { CANVAS, CTX } from './canvas';


/**
 * Represents a sprite (a game image).
 * @class
 */
export class GameSprite {
    constructor(images) {
        this.images = images;
        this.imageIndex = 0;
        this.updateTime = null;
        this.updateImage();
    }

    update() {
        this.updateImage();
    }

    updateImage() {
        let date = new Date();
        let time = date.getTime();

        if (!time || time - this.updateTime > 50) {
            this.updateTime = time;

            this.imageIndex = (this.imageIndex + 1 >= this.images.length) ? 0 : this.imageIndex + 1;
            this.image = this.images[this.imageIndex];

            let img = new Image();

            img.onload = () => {
                this.width = img.width;
                this.height = img.height;
            }

            img.src = this.images[this.imageIndex].src;
        }
    }
}


/**
 * Represents an object in the game (player, platform block etc.).
 * @abstract
 */
export class GameObject {
    constructor(gameRoom, sprite) {
        this.sprite = sprite;
        this.x = 0;
        this.y = 0;
    }

    draw() {
        CTX.drawImage(this.sprite.image,
            this.x,
            this.y,
            this.sprite.width,
            this.sprite.height)
    }

    update() {
        this.sprite.update();
    };

    isAtPosition(x, y) {
        let isAtX = (x >= this.x && x <= this.x + this.sprite.width);
        let isAtY = (y >= this.y && y <= this.y + this.sprite.height);
        return isAtX && isAtY;
    }

    isInsideGameRoom() {
        let isInsideX = (this.x + this.sprite.width >= 0 && this.x <= CANVAS.width);
        let isInsideY = (this.y <=CANVAS.height && this.y + this.sprite.height >= 0);
        return isInsideX && isInsideY;
    }
}


/**
 * A game object that is affected by gravity.
 * @abstract
 */
export class GravitatingGameObject extends GameObject {
    constructor(gameRoom, sprite) {
        super(gameRoom, sprite);
        this.gameRoom = gameRoom;
        this.gravitySpeed = 1;
    }

    update() {
        super.update();
        this.gravitate();
    }

    gravitate() {
        if (this.isAirborne()) {
            this.y += this.gravitySpeed;
            this.gravitySpeed++;
        } else {
            if (Math.abs(this.gravitySpeed) < 3) {
                this.land();            
            } else {
                this.gravitySpeed = this.gravitySpeed * -0.25;
            }
        }
    }

    land() {
        let object = this.gameRoom.findNearestGameObjectBelowPoint(this.x, this.y, this);
        
        if (object) {
            this.y = object.y - this.sprite.height;
        }

        this.gravitySpeed = 0;
    }

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