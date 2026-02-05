class CrossGame {
    constructor() {
        this.canvas = document.getElementById('crossCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Résolution logique fixe (16:9 haute définition)
        this.width = 1600;
        this.height = 900;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.player = { x: 200, y: 700, w: 70, h: 70, dy: 0, rot: 0 };
        this.obstacles = [];
        this.particles = [];
        this.score = 0;
        this.gravity = 1.2;
        this.jumpForce = -28;
        this.speed = 12;
        this.isGrounded = false;
        
        this.init();
    }

    init() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.type === 'touchstart') {
                if (this.isGrounded) {
                    this.player.dy = this.jumpForce;
                    this.isGrounded = false;
                }
            }
        });
        this.loop();
    }

    spawnObstacle() {
        if (Math.random() < 0.02) { // 2% de chance par frame
            if (this.obstacles.length === 0 || this.obstacles[this.obstacles.length-1].x < 1000) {
                this.obstacles.push({ x: 1700, y: 770, w: 60, h: 100 });
            }
        }
    }

    update() {
        // Gravité & Physique
        this.player.dy += this.gravity;
        this.player.y += this.player.dy;

        // Limite du sol (Y=770 pour un cube de 70px)
        if (this.player.y >= 700) {
            this.player.y = 700;
            this.player.dy = 0;
            this.isGrounded = true;
            this.player.rot = 0;
        } else {
            this.isGrounded = false;
            this.player.rot += 0.15; // Rotation fluide
        }

        // Obstacles
        this.spawnObstacle();
        this.obstacles.forEach((ob, i) => {
            ob.x -= this.speed;
            
            // Collision ultra-précise (Hitbox réduite de 10% pour le plaisir de jeu)
            if (this.player.x + 10 < ob.x + ob.w &&
                this.player.x + this.player.w - 10 > ob.x &&
                this.player.y + 10 < ob.y + ob.h &&
                this.player.y + this.player.h - 10 > ob.y) {
                this.reset();
            }

            if (ob.x < -100) {
                this.obstacles.splice(i, 1);
                this.score++;
                this.speed += 0.1; // Difficultée progressive
            }
        });
    }

    reset() {
        this.obstacles = [];
        this.speed = 12;
        this.score = 0;
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Fond (Grille Cyber)
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
        ctx.lineWidth = 2;
        for(let i=0; i<this.width; i+=100) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, this.height); ctx.stroke();
        }

        // Sol Néon
        ctx.fillStyle = '#00ff88';
        ctx.shadowBlur = 20; ctx.shadowColor = '#00ff88';
        ctx.fillRect(0, 770, this.width, 10);

        // Dessin Joueur
        ctx.save();
        ctx.translate(this.player.x + 35, this.player.y + 35);
        ctx.rotate(this.player.rot);
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(-35, -35, 70, 70);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.strokeRect(-35, -35, 70, 70);
        ctx.restore();

        // Dessin Obstacles (Triangles rouges)
        ctx.shadowBlur = 15; ctx.shadowColor = '#ff0055';
        ctx.fillStyle = '#ff0055';
        this.obstacles.forEach(ob => {
            ctx.beginPath();
            ctx.moveTo(ob.x, ob.y + ob.h);
            ctx.lineTo(ob.x + ob.w / 2, ob.y);
            ctx.lineTo(ob.x + ob.w, ob.y + ob.h);
            ctx.fill();
        });

        // Score
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 50px Inter';
        ctx.fillText(this.score.toString().padStart(2, '0'), 50, 80);
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

window.onload = () => new CrossGame();
