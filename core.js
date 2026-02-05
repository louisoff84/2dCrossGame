class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 1.0;
        this.color = color;
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= 0.02 * dt;
    }
}

class Player {
    constructor() {
        this.x = 150; this.y = 350; this.size = 32;
        this.dy = 0; this.rot = 0;
        this.grounded = false;
    }
    reset() { this.y = 350; this.dy = 0; this.rot = 0; }
}

class CrossEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = new Player();
        this.particles = [];
        this.obstacles = [];
        this.lastTime = 0;
        this.score = 0;
        this.best = localStorage.getItem('cg_best') || 0;
        
        this.config = { gravity: 0.7, jump: 12, speed: 8 };
        this.init();
    }

    init() {
        window.addEventListener('keydown', e => {
            if((e.code === 'Space' || e.code === 'ArrowUp') && this.player.grounded) {
                this.player.dy = -this.config.jump;
                this.player.grounded = false;
                this.spawnParticles(this.player.x, this.player.y + 32, '#fff', 5);
            }
            if(e.code === 'KeyP') this.toggleAdmin();
        });
        this.spawnObstacle();
        requestAnimationFrame(t => this.loop(t));
    }

    spawnObstacle() {
        setInterval(() => {
            if(document.hidden) return;
            this.obstacles.push({ x: 900, y: 382, w: 30, h: 40 });
        }, 1500);
    }

    spawnParticles(x, y, color, count) {
        for(let i=0; i<count; i++) this.particles.push(new Particle(x, y, color));
    }

    loop(t) {
        const dt = (t - this.lastTime) / 16.67 || 1;
        this.lastTime = t;
        this.update(dt);
        this.draw();
        requestAnimationFrame(t => this.loop(t));
    }

    update(dt) {
        this.player.dy += this.config.gravity * dt;
        this.player.y += this.player.dy * dt;

        if(this.player.y >= 350) {
            this.player.y = 350; this.player.dy = 0;
            this.player.grounded = true; this.player.rot = 0;
        } else {
            this.player.grounded = false;
            this.player.rot += 6 * dt;
        }

        // Obstacles & Collision
        this.obstacles.forEach((ob, i) => {
            ob.x -= this.config.speed * dt;
            if(ob.x < -50) {
                this.obstacles.splice(i, 1);
                this.score++;
                if(this.score > this.best) {
                    this.best = this.score;
                    localStorage.setItem('cg_best', this.best);
                }
            }

            if (this.player.x < ob.x + ob.w && this.player.x + 32 > ob.x &&
                this.player.y + 32 > ob.y - ob.h && this.player.y < ob.y) {
                this.gameOver();
            }
        });

        this.particles.forEach((p, i) => {
            p.update(dt);
            if(p.life <= 0) this.particles.splice(i, 1);
        });
    }

    gameOver() {
        this.spawnParticles(this.player.x + 16, this.player.y + 16, '#ff0055', 20);
        this.player.reset();
        this.score = 0;
    }

    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, 800, 450);

        ctx.strokeStyle = 'rgba(255,255,255,0.02)';
        for(let i=0; i<800; i+=40) { ctx.strokeRect(i, 0, 40, 450); }

        ctx.save();
        ctx.translate(this.player.x + 16, this.player.y + 16);
        ctx.rotate(this.player.rot * Math.PI / 180);
        ctx.shadowBlur = 15; ctx.shadowColor = varColor('--primary');
        ctx.fillStyle = varColor('--primary');
        ctx.fillRect(-16, -16, 32, 32);
        ctx.strokeStyle = '#fff'; ctx.strokeRect(-16, -16, 32, 32);
        ctx.restore();

        this.obstacles.forEach(ob => {
            ctx.shadowBlur = 0;
            ctx.fillStyle = varColor('--danger');
            ctx.beginPath();
            ctx.moveTo(ob.x, ob.y);
            ctx.lineTo(ob.x + ob.w/2, ob.y - ob.h);
            ctx.lineTo(ob.x + ob.w, ob.y);
            ctx.fill();
        });

        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 4, 4);
        });
        ctx.globalAlpha = 1;

        ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Inter';
        ctx.fillText(`SCORE: ${this.score}`, 20, 30);
        ctx.fillStyle = varColor('--secondary');
        ctx.fillText(`BEST: ${this.best}`, 20, 50);
    }

    toggleAdmin() {
        const el = document.getElementById('adminPanel');
        el.style.display = el.style.display === 'block' ? 'none' : 'block';
    }
}

const varColor = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
window.onload = () => { window.engine = new CrossEngine(); };
