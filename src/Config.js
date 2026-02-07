export const W = 300;
export const H = 200;
export const SCALE = 3;

export const CELL = Object.freeze({
    EMPTY: 0,
    SAND: 1,
    WATER: 2,
    STONE: 3
});

export const PALETTE = {
    [CELL.EMPTY]: [17, 17, 17, 255],
    [CELL.SAND]: [194, 178, 128, 255],
    [CELL.WATER]: [60, 120, 220, 255],
    [CELL.STONE]: [120, 120, 120, 255]
};