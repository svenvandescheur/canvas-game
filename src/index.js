import { CANVAS, CTX } from './canvas';
import { Level } from './rooms';


/**
 * Adjust the canvas size to the window size.
 */
function adjustCanvasSize() {
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
}


/**
 * The main entry point, stats the game.
 */
function main() {
    adjustCanvasSize();
    window.addEventListener('resize', adjustCanvasSize)
    new Level();
}

// Push main to the end of the event loop, allow the sprites to load.
setTimeout(() => { main(); }, 0);