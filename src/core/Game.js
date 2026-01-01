import { ENEMY_TYPES } from "../data/EnemyData.js";
import { LEVELS } from "../data/LevelData.js";
import { WEAPONS_DB } from "../data/WeaponData.js";
import { Particle } from "../effects/Particle.js";
import { Enemy } from "../entities/Enemy.js";
import { Player } from "../entities/Player.js";
import { Projectile } from "../entities/Projectile.js";
import { Turret } from "../entities/Turret.js";
import { UI } from "./UI.js"; // Importando a UI

class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    // 1. Instanciar a UI (Isso é o que faltava!)
    this.ui = new UI();

    // 2. Configurar o tamanho correto
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // 3. Estado Inicial
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
    this.score = 0;
    this.spawnTimer = 0;
    this.baseMaxHealth = 100;
    this.baseHealth = 100;
    this.isGameOver = false;
    this.currentLevelIndex = 0;

    // Criar player
    this.player = new Player(this.canvas.width, this.canvas.height);
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height - 60;

    this.prepareLevel();

    // Atualiza a UI usando a nova classe
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

  getClosestEnemy() {
    let closest = null;
    let minDistance = Infinity;
    this.enemies.forEach((enemy) => {
      const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
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
    } else {
      const newTurret = new Turret(
        this.player.x,
        this.player.y,
        key,
        this.inventory.length
      );
      this.inventory.push(newTurret);
    }
    this.isGameOver = false;
  }

  update() {
    if (this.isGameOver) return;

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

    const target = this.getClosestEnemy();

    // Player fire
    this.player.fireTimer++;
    if (this.player.fireTimer >= this.player.fireRate && target) {
      this.projectiles.push(
        new Projectile(
          this.player.x,
          this.player.y - 20,
          target.x,
          target.y,
          "#4df3ff"
        )
      );
      this.player.fireTimer = 0;
    }

    this.inventory.forEach((t) =>
      t.update(this.player.x, this.player.y, target, this.projectiles)
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
    this.inventory.forEach((t) =>
      t.draw(this.ctx, this.player.x, this.player.y)
    );
    this.enemies.forEach((e) => e.draw(this.ctx));
    this.projectiles.forEach((p) => p.draw(this.ctx));
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
