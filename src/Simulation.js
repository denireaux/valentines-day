import { CELL, W, H } from './Config.js';

export class Simulation {
    constructor() {
        this.grid = new Uint8Array(W * H);
    }

    idx(x, y) { return y * W + x; }

    setCell(x, y, v) {
        if (x >= 0 && x < W && y >= 0 && y < H) {
            this.grid[this.idx(x, y)] = v;
        }
    }

    swap(i1, i2) {
        const t = this.grid[i1];
        this.grid[i1] = this.grid[i2];
        this.grid[i2] = t;
    }

    step() {
        for (let y = H - 2; y >= 0; y--) {
            for (let x = 0; x < W; x++) {
                this.updateCell(x, y);
            }
        }
    }

    updateCell(x, y) {
        const i = this.idx(x, y);
        const v = this.grid[i];
        if (v === CELL.EMPTY || v === CELL.STONE) return;

        const belowY = y + 1;
        if (belowY >= H) return;
        const iBelow = this.idx(x, belowY);
        const b = this.grid[iBelow];

        if (v === CELL.SAND) {
            if (b === CELL.EMPTY || b === CELL.WATER) { this.swap(i, iBelow); return; }
            const dir = Math.random() < 0.5 ? -1 : 1;
            for (let d of [dir, -dir]) {
                let nx = x + d;
                if (nx >= 0 && nx < W) {
                    let ni = this.idx(nx, belowY);
                    if (this.grid[ni] === CELL.EMPTY || this.grid[ni] === CELL.WATER) {
                        this.swap(i, ni); return;
                    }
                }
            }
        }

        if (v === CELL.WATER) {
            if (b === CELL.EMPTY) { this.swap(i, iBelow); return; }
            const dir = Math.random() < 0.5 ? -1 : 1;
            for (let d of [dir, -dir]) {
                let nx = x + d;
                if (nx >= 0 && nx < W && this.grid[this.idx(nx, y)] === CELL.EMPTY) {
                    this.swap(i, this.idx(nx, y)); return;
                }
            }
        }
    }
}