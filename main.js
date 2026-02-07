// main.js
// FallingSand (Canvas + Uint8Array grid) + centered stone text stamp + custom textbox stamping

const W = 300;
const H = 200;
const SCALE = 3; // visual scale only

// cell ids
const EMPTY = 0, SAND = 1, WATER = 2, STONE = 3;

const grid = new Uint8Array(W * H);

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d", { alpha: false });

canvas.width = W;
canvas.height = H;
canvas.style.width = (W * SCALE) + "px";
canvas.style.height = (H * SCALE) + "px";

const img = ctx.createImageData(W, H);
const pixels = img.data;

let running = true;
let brush = SAND;
let mouseDown = false;

const info = document.getElementById("info");

function idx(x, y) { return y * W + x; }
function inBounds(x, y) { return x >= 0 && x < W && y >= 0 && y < H; }

function swap(i1, i2) {
  const t = grid[i1];
  grid[i1] = grid[i2];
  grid[i2] = t;
}

function setCell(x, y, v) {
  if (!inBounds(x, y)) return;
  grid[idx(x, y)] = v;
}

// ----------------------------
// Tiny bitmap font for stamping
// ----------------------------
const FONT = {
  A: [
    "0110",
    "1001",
    "1111",
    "1001",
    "1001",
  ],
  D: [
    "1110",
    "1001",
    "1001",
    "1001",
    "1110",
  ],
  E: [
    "1111",
    "1000",
    "1110",
    "1000",
    "1111",
  ],
  F: [
    "1111",
    "1000",
    "1110",
    "1000",
    "1000",
  ],
  G: [
    "0111",
    "1000",
    "1011",
    "1001",
    "0111",
  ],
  I: [
    "111",
    "010",
    "010",
    "010",
    "111",
  ],
  L: [
    "1000",
    "1000",
    "1000",
    "1000",
    "1111",
  ],
  N: [
    "1001",
    "1101",
    "1011",
    "1001",
    "1001",
  ],
  O: [
    "0110",
    "1001",
    "1001",
    "1001",
    "0110",
  ],
  R: [
    "1110",
    "1001",
    "1110",
    "1010",
    "1001",
  ],
  S: [
    "0111",
    "1000",
    "0110",
    "0001",
    "1110",
  ],
  U: [
    "1001",
    "1001",
    "1001",
    "1001",
    "0110",
  ],
  V: [
    "1001",
    "1001",
    "1001",
    "0110",
    "0100",
  ],
  W: [
    "10001",
    "10001",
    "10101",
    "11011",
    "10001",
  ],
  Y: [
    "1001",
    "0110",
    "0100",
    "0100",
    "0100",
  ],
  " ": [
    "000",
    "000",
    "000",
    "000",
    "000",
  ]
};

function glyphWidth(glyph) {
  return glyph[0].length;
}

function measureTextCells(text, scale = 2) {
  // Total width in *grid cells* that stampText would occupy.
  // cursorX += (glyphWidth + 1) * scale per character
  let width = 0;
  let height = 0;

  for (const ch of text.toUpperCase()) {
    const glyph = FONT[ch] || FONT[" "];
    width += (glyphWidth(glyph) + 1) * scale;
    height = Math.max(height, glyph.length * scale);
  }

  // Remove one trailing "space column" worth of padding if we want tighter centering
  if (width > 0) width -= 1 * scale;

  return { width, height };
}

function stampText(text, startX, startY, scale = 2, cellType = STONE) {
  let cursorX = startX;

  for (const ch of text.toUpperCase()) {
    const glyph = FONT[ch] || FONT[" "];

    for (let gy = 0; gy < glyph.length; gy++) {
      for (let gx = 0; gx < glyph[gy].length; gx++) {
        if (glyph[gy][gx] === "1") {
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              const x = cursorX + gx * scale + sx;
              const y = startY + gy * scale + sy;
              if (inBounds(x, y)) grid[idx(x, y)] = cellType;
            }
          }
        }
      }
    }

    cursorX += (glyphWidth(glyph) + 1) * scale;
  }
}

function stampCentered(text, scale = 2, cellType = STONE) {
  const m = measureTextCells(text, scale);
  const startX = Math.max(0, Math.floor((W - m.width) / 2));
  const startY = Math.max(0, Math.floor((H - m.height) / 2));
  stampText(text, startX, startY, scale, cellType);
}

// ----------------------------
// Simulation rules
// ----------------------------
function updateCell(x, y) {
  const i = idx(x, y);
  const v = grid[i];
  if (v === EMPTY || v === STONE) return;

  const belowY = y + 1;
  if (belowY >= H) return;

  const iBelow = idx(x, belowY);
  const below = grid[iBelow];

  if (v === SAND) {
    // fall through empty or water (swap with water)
    if (below === EMPTY || below === WATER) {
      swap(i, iBelow);
      return;
    }

    // diagonals
    const dir = (Math.random() < 0.5) ? -1 : 1;
    const x1 = x + dir;
    const x2 = x - dir;

    if (inBounds(x1, belowY)) {
      const iDiag = idx(x1, belowY);
      const d = grid[iDiag];
      if (d === EMPTY || d === WATER) { swap(i, iDiag); return; }
    }
    if (inBounds(x2, belowY)) {
      const iDiag = idx(x2, belowY);
      const d = grid[iDiag];
      if (d === EMPTY || d === WATER) { swap(i, iDiag); return; }
    }
  }

  if (v === WATER) {
    // fall
    if (below === EMPTY) { swap(i, iBelow); return; }

    // spread sideways
    const dir = (Math.random() < 0.5) ? -1 : 1;
    const x1 = x + dir;
    const x2 = x - dir;

    if (inBounds(x1, y) && grid[idx(x1, y)] === EMPTY) { swap(i, idx(x1, y)); return; }
    if (inBounds(x2, y) && grid[idx(x2, y)] === EMPTY) { swap(i, idx(x2, y)); return; }

    // try diagonals down
    if (inBounds(x1, belowY) && grid[idx(x1, belowY)] === EMPTY) { swap(i, idx(x1, belowY)); return; }
    if (inBounds(x2, belowY) && grid[idx(x2, belowY)] === EMPTY) { swap(i, idx(x2, belowY)); return; }
  }
}

function step() {
  // bottom-up for gravity feel
  for (let y = H - 2; y >= 0; y--) {
    for (let x = 0; x < W; x++) {
      updateCell(x, y);
    }
  }
}

// ----------------------------
// Rendering
// ----------------------------
function render() {
  for (let i = 0; i < grid.length; i++) {
    const v = grid[i];
    const p = i * 4;

    // simple palette
    if (v === EMPTY) { pixels[p]=17;  pixels[p+1]=17;  pixels[p+2]=17;  pixels[p+3]=255; }
    else if (v === SAND) { pixels[p]=194; pixels[p+1]=178; pixels[p+2]=128; pixels[p+3]=255; }
    else if (v === WATER) { pixels[p]=60; pixels[p+1]=120; pixels[p+2]=220; pixels[p+3]=255; }
    else if (v === STONE) { pixels[p]=120; pixels[p+1]=120; pixels[p+2]=120; pixels[p+3]=255; }
  }
  ctx.putImageData(img, 0, 0);
}

// ----------------------------
// Input (painting)
// ----------------------------
function paintAtClient(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((clientX - rect.left) / rect.width * W);
  const y = Math.floor((clientY - rect.top) / rect.height * H);

  const r = 3; // brush radius
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx*dx + dy*dy <= r*r) setCell(x + dx, y + dy, brush);
    }
  }
}

canvas.addEventListener("mousedown", (e) => {
  mouseDown = true;
  paintAtClient(e.clientX, e.clientY);
});
window.addEventListener("mouseup", () => { mouseDown = false; });
canvas.addEventListener("mousemove", (e) => { if (mouseDown) paintAtClient(e.clientX, e.clientY); });

document.getElementById("toggle").onclick = () => {
  running = !running;
  document.getElementById("toggle").textContent = running ? "Pause" : "Play";
};

document.getElementById("clear").onclick = () => grid.fill(0);

document.querySelectorAll("button[data-brush]").forEach(b => {
  b.onclick = () => brush = Number(b.dataset.brush);
});

// ----------------------------
// Textbox controls
// ----------------------------
const msgInput = document.getElementById("msg");
const stampBtn = document.getElementById("stamp");
const stampClearBtn = document.getElementById("stampClear");

function doStamp(clearFirst) {
  const text = (msgInput?.value || "").trim();
  if (clearFirst) grid.fill(0);
  if (text.length > 0) stampCentered(text, 2, STONE);
}

stampBtn?.addEventListener("click", () => doStamp(false));
stampClearBtn?.addEventListener("click", () => doStamp(true));

// nice UX: hit Enter to stamp
msgInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") doStamp(false);
});

// ----------------------------
// Startup "written in stone" centered
// ----------------------------
stampCentered("Always Falling For You Susan", 2, STONE);

// ----------------------------
// Main loop + FPS
// ----------------------------
let last = performance.now();
let frames = 0;

function loop(now) {
  if (running) step();
  render();

  frames++;
  const dt = now - last;
  if (dt >= 500) {
    const fps = Math.round(frames * 1000 / dt);
    frames = 0;
    last = now;
    info.textContent = `FPS: ${fps}`;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
