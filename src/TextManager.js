import { FONT } from './Font.js';
import { CELL, W, H } from './Config.js';

export class TextManager {
    constructor(simulation) {
        this.sim = simulation;
    }

    stampCentered(text, scale = 2) {
        let totalW = 0;
        const chars = text.toUpperCase().split("");
        chars.forEach(c => {
            const g = FONT[c] || FONT[" "];
            totalW += (g[0].length + 1) * scale;
        });
        
        let curX = Math.floor((W - totalW) / 2);
        let curY = Math.floor((H - 5 * scale) / 2);

        chars.forEach(c => {
            const g = FONT[c] || FONT[" "];
            for (let gy = 0; gy < g.length; gy++) {
                for (let gx = 0; gx < g[gy].length; gx++) {
                    if (g[gy][gx] === "1") {
                        for (let sy = 0; sy < scale; sy++) {
                            for (let sx = 0; sx < scale; sx++) {
                                this.sim.setCell(curX + gx * scale + sx, curY + gy * scale + sy, CELL.STONE);
                            }
                        }
                    }
                }
            }
            curX += (g[0].length + 1) * scale;
        });
    }
}