import { ENEMY_TYPES } from "../data/EnemyData.js";
import { LEVELS } from "../data/LevelData.js";
import { WEAPONS_DB } from "../data/WeaponData.js";
import { Particle } from "../effects/Particle.js";
import { Enemy } from "../entities/Enemy.js";
import { Player } from "../entities/Player.js";
import { Projectile } from "../entities/Projectile.js";
import { Turret } from "../entities/Turret.js";
import { UI } from "./UI.js";

class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.ui = new UI();
    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.mouse = { x: 0, y: 0 };
    this.isPlacingTurret = false;
    this.turretToPlace = null;

    this.isGameOver = false;
    this.currentLevelIndex = 0;
    this.isLevelTransitioning = false;
    this.xp = 0;
    this.xpNextLevel = 100;
    this.level = 1;
    this.inventory = [];
    this.particles = [];
    this.enemies = [];
    this.projectiles = [];

    this.init();
    this.resetGame();
    this.gameLoop();
  }

  init() {
    document.getElementById("retry-button").addEventListener("click", () => {
      this.resetGame();
    });

    // Eventos de mouse para posicionar torretas
    this.canvas.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.canvas.addEventListener("click", () => {
      if (this.isPlacingTurret) {
        this.placeTurret();
      }
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.player) {
      this.player.x = this.canvas.width / 2;
      this.player.y = this.canvas.height - 60;
    }
  }

  resetGame() {
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.inventory = [];
    this.score = 0;
    this.spawnTimer = 0;
    this.baseMaxHealth = 100;
    this.baseHealth = 100;
    this.isGameOver = false;
    this.isPlacingTurret = false;
    this.turretToPlace = null;
    this.currentLevelIndex = 0;

    this.player = new Player(this.canvas.width, this.canvas.height);
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height - 60;

    this.prepareLevel();

    this.ui.updateStats(this.baseHealth, this.score, this.level);
    this.ui.updateXP(this.xp, this.xpNextLevel);
    this.ui.hideModal("game-over-screen");
  }

  prepareLevel() {
    const level = LEVELS[this.currentLevelIndex];
    this.enemyQueue = [];
    for (const [tipo, quantidade] of Object.entries(level.horda)) {
      for (let i = 0; i < quantidade; i++) {
        this.enemyQueue.push(tipo);
      }
    }
    this.enemyQueue.sort(() => Math.random() - 0.5);
  }

  gameOver() {
    this.isGameOver = true;
    this.ui.showGameOver(this.score);
  }

  // Agora aceita uma posição para encontrar o inimigo mais próximo
  getClosestEnemy(fromX, fromY) {
    let closest = null;
    let minDistance = Infinity;
    this.enemies.forEach((enemy) => {
      const dist = Math.hypot(fromX - enemy.x, fromY - enemy.y);
      if (dist < minDistance) {
        minDistance = dist;
        closest = enemy;
      }
    });
    return closest;
  }

  addXP(amount) {
    this.xp += amount;
    if (this.xp >= this.xpNextLevel) {
      this.levelUp();
    }
    this.ui.updateXP(this.xp, this.xpNextLevel);
  }

  levelUp() {
    this.isGameOver = true;
    this.xp -= this.xpNextLevel;
    this.level++;
    this.xpNextLevel = Math.floor(this.xpNextLevel * 1.5);

    const keys = Object.keys(WEAPONS_DB);
    const shuffled = keys.sort(() => 0.5 - Math.random()).slice(0, 3);

    this.ui.showLevelUp(
      shuffled,
      (key) => this.selectWeapon(key),
      (canv, type) => this.drawWeaponIcon(canv, type)
    );
  }

  drawWeaponIcon(canvas, type) {
    const ctx = canvas.getContext("2d");
    const color = WEAPONS_DB[type].cor;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.clearRect(0, 0, 100, 100);

    ctx.beginPath();
    if (type === "RAIO") {
      ctx.moveTo(50, 20);
      ctx.lineTo(30, 60);
      ctx.lineTo(50, 60);
      ctx.lineTo(40, 90);
    } else if (type === "COLMEIA") {
      ctx.arc(50, 50, 20, 0, Math.PI * 2);
    } else {
      ctx.rect(30, 30, 40, 40);
    }
    ctx.stroke();
  }

  selectWeapon(key) {
    const existingTurret = this.inventory.find((t) => t.weaponKey === key);
    if (existingTurret) {
      existingTurret.level++;
      this.isGameOver = false; // Continua o jogo
    } else {
      // Entra no modo de posicionamento
      this.isPlacingTurret = true;
      this.turretToPlace = key;
      this.ui.hideModal("level-up-modal");
    }
  }

  placeTurret() {
    // Não permite colocar na área do chão
    if (this.mouse.y < this.canvas.height - 40) {
      this.inventory.push(
        new Turret(this.mouse.x, this.mouse.y, this.turretToPlace)
      );
      this.isPlacingTurret = false;
      this.turretToPlace = null;
      this.isGameOver = false; // O jogo continua após colocar a torreta
    }
  }

  update() {
    if (this.isGameOver && !this.isPlacingTurret) return;

    if (this.isPlacingTurret) return; // Pausa a lógica do jogo enquanto posiciona

    const currentLevel = LEVELS[this.currentLevelIndex];
    this.spawnTimer++;

    if (
      this.enemyQueue.length > 0 &&
      this.spawnTimer > currentLevel.spawnRate
    ) {
      const enemyKey = this.enemyQueue.shift();
      this.enemies.push(new Enemy(this.canvas.width, ENEMY_TYPES[enemyKey]));
      this.spawnTimer = 0;
    } else if (
      this.enemyQueue.length === 0 &&
      this.enemies.length === 0 &&
      !this.isLevelTransitioning
    ) {
      this.nextLevel();
    }

    const playerTarget = this.getClosestEnemy(this.player.x, this.player.y);

    this.player.fireTimer++;
    if (this.player.fireTimer >= this.player.fireRate && playerTarget) {
      this.projectiles.push(
        new Projectile(
          this.player.x,
          this.player.y - 20,
          playerTarget.x,
          playerTarget.y,
          "#4df3ff"
        )
      );
      this.player.fireTimer = 0;
    }

    // Passa a função getClosestEnemy para cada torreta
    this.inventory.forEach((t) =>
      t.update((x, y) => this.getClosestEnemy(x, y), this.projectiles)
    );

    this.projectiles.forEach((p, i) => {
      p.update();
      if (p.y < 0 || p.x < 0 || p.x > this.canvas.width)
        this.projectiles.splice(i, 1);
    });

    this.particles.forEach((p, i) => {
      p.update();
      if (p.alpha <= 0) this.particles.splice(i, 1);
    });

    this.enemies.forEach((enemy, eIndex) => {
      enemy.update();
      if (enemy.y + enemy.radius >= this.canvas.height - 25) {
        this.enemies.splice(eIndex, 1);
        this.baseHealth -= enemy.danoNaBase;
        this.ui.updateStats(this.baseHealth, this.score, this.level);
        if (this.baseHealth <= 0) this.gameOver();
        return;
      }

      this.projectiles.forEach((p, pIndex) => {
        const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
        if (dist < enemy.radius + p.radius + 5) {
          this.projectiles.splice(pIndex, 1);
          enemy.health -= 500;
          if (enemy.health <= 0) {
            for (let i = 0; i < 15; i++)
              this.particles.push(new Particle(enemy.x, enemy.y, enemy.color));
            this.enemies.splice(eIndex, 1);
            this.score += 10;
            this.addXP(25);
            this.ui.updateStats(this.baseHealth, this.score, this.level);
          }
        }
      });
    });
  }

  nextLevel() {
    if (this.currentLevelIndex < LEVELS.length - 1) {
      this.isLevelTransitioning = true;
      setTimeout(() => {
        this.currentLevelIndex++;
        this.prepareLevel();
        this.spawnTimer = 0;
        this.isLevelTransitioning = false;
      }, 2000);
    } else {
      this.gameOver();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBase();
    this.particles.forEach((p) => p.draw(this.ctx));
    this.player.draw(this.ctx);
    this.inventory.forEach((t) => t.draw(this.ctx)); // Desenha sem playerX/Y
    this.enemies.forEach((e) => e.draw(this.ctx));
    this.projectiles.forEach((p) => p.draw(this.ctx));

    if (this.isPlacingTurret) {
      this.drawTurretPreview();
    }
  }

  drawTurretPreview() {
    const key = this.turretToPlace;
    if (!key) return;

    const x = this.mouse.x;
    const y = this.mouse.y;
    const data = WEAPONS_DB[key];

    this.ctx.save();
    this.ctx.globalAlpha = 0.5; // Deixa o preview transparente
    this.ctx.translate(x, y);
    this.ctx.fillStyle = data.cor;
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2;

    if (key === "RAIO") {
      this.ctx.beginPath();
      this.ctx.moveTo(0, -15);
      this.ctx.lineTo(10, 0);
      this.ctx.lineTo(0, 15);
      this.ctx.lineTo(-10, 0);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    } else if (key === "COLMEIA") {
      this.ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        this.ctx.lineTo(
          12 * Math.cos((i * Math.PI) / 3),
          12 * Math.sin((i * Math.PI) / 3)
        );
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    } else {
      this.ctx.fillRect(-10, -10, 20, 20);
      this.ctx.strokeRect(-10, -10, 20, 20);
    }

    this.ctx.restore();

    // Desenha o raio de alcance (opcional)
    this.ctx.beginPath();
    this.ctx.arc(x, y, 150, 0, Math.PI * 2); // Raio de 150, ajuste se necessário
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    this.ctx.stroke();
  }

  drawBase() {
    const groundHeight = 25;
    const yPos = this.canvas.height - groundHeight;
    this.ctx.fillStyle = "#3e2723";
    this.ctx.fillRect(0, yPos, this.canvas.width, groundHeight);
    this.ctx.fillStyle = "#4caf50";
    this.ctx.fillRect(0, yPos, this.canvas.width, 5);
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

new Game();
