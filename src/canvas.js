import BEM from 'bem.js';
import { Level } from './rooms';


/** {HTMLCanvasElement} representing the canvas. */
export const CANVAS = BEM.getBEMNode('canvas')

/** {CanvasRenderingContext2D} the drawing context. */
export const CTX = CANVAS.getContext('2d');