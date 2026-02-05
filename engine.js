class CrossEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.dt = 0; this.lastTime = 0;
        
        this.player = { x: 120, y: 340, w: 32, h: 32, dy: 0, rot: 0, trail: [] };
        this.obstacles = [];
        this.config = { gravity: 0.8, jump: -13, speed: 8, active: false };
        this.score = 0;

        window.addEventListener('keydown', e => {
            if(e.code === 'Space' && this.player.y >= 340) this.player.dy = this.config.jump;
        });
    }

    start() { this.config.active = true; this.spawnManager(); this.loop(); }

    spawnManager() {
        this.spawner = setInterval(() => {
            if(this.config.active) this.obstacles.push({ x: 900, y: 372, w: 30, h: 40 });
        }, 1400);
    }

    loop(t = 0) {
        this.dt = (t - this.lastTime) / 16.67;
        this.lastTime = t;

        if(this.config.active) {
            this.update();
            this.draw();
        }
        requestAnimationFrame(t => this.loop(t));
    }

    update() {
        // Physique Joueur
        this.player.dy += this.config.gravity * this.dt;
        this.player.y += this.player.dy * this.dt;

        // Rotation & Sol
        if(this.player.y >= 340) {
            this.player.y = 340; this.player.dy = 0; this.player.rot = 0;
        } else {
            this.player.rot += 7 * this.dt;
        }

        // Gestion de la traînée (Trail effect)
        this.player.trail.push({x: this.player.x, y: this.player.y});
        if(this.player.trail.length > 10) this.player.trail.shift();

        // Obstacles
        this.obstacles.forEach((ob, i) => {
            ob.x -= this.config.speed * this.dt;
            if(ob.x < -100) { this.obstacles.splice(i, 1); this.score++; }

            // Collision précise
            if (this.player.x < ob.x + ob.w && this.player.x + 32 > ob.x &&
                this.player.y + 32 > ob.y) this.reset();
        });
    }

    reset() {
        Auth.updateBest(this.score);
        this.score = 0;
        this.obstacles = [];
        this.player.y = 340;
    }

    draw() {
        const c = this.ctx;
        c.clearRect(0, 0, 800, 450);

        // Trail
        this.player.trail.forEach((p, i) => {
            c.fillStyle = `rgba(0, 255, 136, ${i / 10})`;
            c.fillRect(p.x + 4, p.y + 4, 24, 24);
        });

        // Player
        c.save();
        c.translate(this.player.x + 16, this.player.y + 16);
        c.rotate(this.player.rot * Math.PI / 180);
        c.shadowBlur = 20; c.shadowColor = '#00ff88';
        c.fillStyle = '#00ff88';
        c.fillRect(-16, -16, 32, 32);
        c.strokeStyle = '#fff'; c.strokeRect(-16, -16, 32, 32);
        c.restore();

        // Obstacles
        c.shadowBlur = 0;
        this.obstacles.forEach(ob => {
            c.fillStyle = '#ff0055';
            c.beginPath();
            c.moveTo(ob.x, ob.y + ob.h);
            c.lineTo(ob.x + ob.w/2, ob.y);
            c.lineTo(ob.x + ob.w, ob.y + ob.h);
            c.fill();
        });

        // Sol Cyber
        c.fillStyle = '#00ff88'; c.fillRect(0, 372, 800, 2);
    }
}
