import { Simulation } from './src/Simulation.js';
import { TextManager } from './src/TextManager.js';
import { W, H, SCALE, PALETTE, CELL } from './src/Config.js';

class App {
    constructor() {
        this.sim = new Simulation();
        this.text = new TextManager(this.sim);
        this.canvas = document.getElementById("c");
        this.ctx = this.canvas.getContext("2d", { alpha: false });
        this.img = this.ctx.createImageData(W, H);
        
        this.brush = CELL.SAND;
        this.running = true;
        this.mouseDown = false;

        this.init();
        this.setupPhotoEvents();
    }

    init() {
        this.canvas.width = W;
        this.canvas.height = H;
        this.canvas.style.width = (W * SCALE) + "px";
        this.canvas.style.height = (H * SCALE) + "px";

        this.setupEvents();
        this.text.stampCentered("Always Falling For You Susan");
        this.loop();
    }

    setupEvents() {
        this.canvas.onmousedown = (e) => { this.mouseDown = true; this.paint(e); };
        window.onmouseup = () => this.mouseDown = false;
        this.canvas.onmousemove = (e) => { if (this.mouseDown) this.paint(e); };
        
        document.getElementById("toggle").onclick = (e) => {
            this.running = !this.running;
            e.target.textContent = this.running ? "Pause" : "Play";
        };

        document.getElementById("clear").onclick = () => this.sim.grid.fill(0);

        document.getElementById("stamp").onclick = () => {
            this.text.stampCentered(document.getElementById("msg").value);
            // Change banner text on click
            const bannerText = document.querySelector(".valentine-banner h1");
            bannerText.textContent = "I knew you'd say yes! ❤️";
            bannerText.style.color = "#ff85a1";
        };

        document.getElementById("stampClear").onclick = () => { 
            this.sim.grid.fill(0); 
            this.text.stampCentered(document.getElementById("msg").value); 
        };
        
        document.querySelectorAll("[data-brush]").forEach(btn => {
            btn.onclick = () => this.brush = parseInt(btn.dataset.brush);
        });
    }

    setupPhotoEvents() {
        const modal = document.getElementById("modal");
        const modalImg = document.getElementById("modal-img");
        const closeBtn = document.querySelector(".modal .close");

        document.querySelectorAll(".expandable").forEach(img => {
            img.onclick = () => {
                modal.style.display = "flex";
                modalImg.src = img.src;
                
                // Spawn a heart in the sand when a photo is clicked!
                const randomX = Math.floor(Math.random() * (W - 20)) + 10;
                const randomY = Math.floor(Math.random() * 50) + 20; 
                if(this.sim.spawnHeart) {
                    this.sim.spawnHeart(randomX, randomY, CELL.SAND);
                }
            };
        });

        closeBtn.onclick = () => modal.style.display = "none";
        modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
    }

    paint(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / rect.width * W);
        const y = Math.floor((e.clientY - rect.top) / rect.height * H);
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                if (dx*dx + dy*dy <= 4) this.sim.setCell(x + dx, y + dy, this.brush);
            }
        }
    }

    loop = () => {
        if (this.running) this.sim.step();
        
        const pixels = this.img.data;
        for (let i = 0; i < this.sim.grid.length; i++) {
            const color = PALETTE[this.sim.grid[i]];
            const p = i * 4;
            pixels[p] = color[0]; pixels[p+1] = color[1]; pixels[p+2] = color[2]; pixels[p+3] = 255;
        }
        this.ctx.putImageData(this.img, 0, 0);
        requestAnimationFrame(this.loop);
    }
}

new App();