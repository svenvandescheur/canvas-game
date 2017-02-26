import BEM from 'bem.js';
import { CANVAS, CTX } from './canvas';
import { Level } from './rooms';


/** {number} width of the canvas. */
const CANVAS_WIDTH = 1200;


/**
 * Preloads all images with class "asset".
 * Returns an array of Promise objects, each resolving when asset is loaded.
 */
function preloadAssets() {
    let assets = BEM.getBEMNodes('asset');
    let promises = [];

    for (let i=0; i<assets.length; i++) {
        let promise = new Promise((resolve, reject) => {
            let asset = assets[i]
            let img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = asset.src;
        });

        promises.push(promise);
    }

    return promises;
}

/**
 * Adjust the canvas size to the window size.
 */
function adjustCanvasSize() {
    CANVAS.width = CANVAS_WIDTH;
    CANVAS.height = window.innerHeight;
}


/**
 * The main entry point, stats the game.
 */
function main() {
    Promise.all(preloadAssets())
        .then(() => {
            adjustCanvasSize();
            window.addEventListener('resize', adjustCanvasSize);
            window.addEventListener('orientationchange', adjustCanvasSize);
            setTimeout(() => { new Level(); });
        })
        .catch((e) => {
            console.error(e);
            alert('An error occured, please restart the application.');
        });
}

main();