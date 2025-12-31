import { Enemy } from "./Enemy.js";
import { ENEMY_TYPES } from "./EnemyData.js";
import { LEVELS } from "./LevelData.js";
import { Player } from "./Player.js";
import { Projectile } from "./Projectile.js";

class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = 600;
    this.canvas.height = 800;
    this.isGameOver = false;
    this.currentLevelIndex = 0;
    this.enemyIndexInLevel = 0;
    this.isLevelTransitioning = false;

    this.init();
    this.resetGame();
    this.gameLoop();
  }

  init() {
    // Configura o evento do botão apenas uma vez
    document.getElementById("retry-button").addEventListener("click", () => {
      this.resetGame();
    });
  }

  resetGame() {
    this.enemies = [];
    this.projectiles = [];
    this.score = 0;
    this.spawnTimer = 0;
    this.baseMaxHealth = 100;
    this.baseHealth = 100;
    this.isGameOver = false;
    this.currentLevelIndex = 0;
    this.enemyIndexInLevel = 0;
    this.updateLevelUI();

    // Atualiza a UI para o estado inicial
    document.getElementById("health").innerText = this.baseHealth;
    document.getElementById("score").innerText = this.score;
    document.getElementById("game-over-screen").style.display = "none";

    this.player = new Player(this.canvas.width, this.canvas.height);
  }

  gameOver() {
    this.isGameOver = true;
    document.getElementById("final-score").innerText = this.score;
    document.getElementById("game-over-screen").style.display = "block";
    // O ALERT FOI REMOVIDO DAQUI
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

  updateLevelUI() {
    const level = LEVELS[this.currentLevelIndex];
    // Você pode adicionar um elemento no HTML para mostrar o nome da fase
    console.log(`Iniciando Fase: ${level.nome}`);
  }

  update() {
    if (this.isGameOver) return;

    const currentLevel = LEVELS[this.currentLevelIndex];
    this.spawnTimer++;

    // 1. SPAWN LOGIC
    if (this.enemyIndexInLevel < currentLevel.inimigos.length) {
      if (this.spawnTimer > currentLevel.spawnRate) {
        const enemyKey = currentLevel.inimigos[this.enemyIndexInLevel];
        const config = ENEMY_TYPES[enemyKey];
        this.enemies.push(new Enemy(this.canvas.width, config));
        this.enemyIndexInLevel++;
        this.spawnTimer = 0;
      }
    } else {
      if (this.enemies.length === 0 && !this.isLevelTransitioning) {
        this.nextLevel();
      }
    }

    // 2. TIRO AUTOMÁTICO
    this.player.fireTimer++;
    if (this.player.fireTimer >= this.player.fireRate) {
      const target = this.getClosestEnemy();
      if (target) {
        this.projectiles.push(
          new Projectile(this.player.x, this.player.y - 20, target.x, target.y)
        );
        this.player.fireTimer = 0;
      }
    }

    // 3. MOVIMENTAÇÃO DOS PROJÉTEIS
    this.projectiles.forEach((p, pIndex) => {
      p.update();
      if (p.y < 0 || p.x < 0 || p.x > this.canvas.width) {
        this.projectiles.splice(pIndex, 1);
      }
    });

    // 4. MOVIMENTAÇÃO E COLISÃO DOS INIMIGOS (Tudo acontece aqui dentro)
    this.enemies.forEach((enemy, eIndex) => {
      enemy.update();

      // Colisão com o chão
      if (enemy.y + enemy.radius >= this.canvas.height - 20) {
        this.enemies.splice(eIndex, 1);
        this.baseHealth -= enemy.danoNaBase;
        document.getElementById("health").innerText = this.baseHealth;
        if (this.baseHealth <= 0) {
          this.baseHealth = 0;
          this.gameOver();
        }
        return; // Pula para o próximo inimigo pois este foi removido
      }

      // Colisão Projétil -> Inimigo (Margem de segurança aumentada aqui)
      this.projectiles.forEach((p, pIndex) => {
        const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
        const margemSeguranca = 5; // Ajuda no acerto de ângulos difíceis

        if (dist < enemy.radius + p.radius + margemSeguranca) {
          this.projectiles.splice(pIndex, 1);
          enemy.health -= 500; // Ajuste conforme a vida no seu JSON

          if (enemy.health <= 0) {
            this.enemies.splice(eIndex, 1);
            this.score += 10;
            document.getElementById("score").innerText = this.score;
          }
        }
      });
    });
  }

  nextLevel() {
    if (this.currentLevelIndex < LEVELS.length - 1) {
      this.isLevelTransitioning = true;

      // Pequena pausa entre fases
      setTimeout(() => {
        this.currentLevelIndex++;
        this.enemyIndexInLevel = 0;
        this.spawnTimer = 0;
        this.isLevelTransitioning = false;
        this.updateLevelUI();
      }, 2000);
    } else {
      alert("PARABÉNS! Você defendeu a Terra de todas as ameaças!");
      this.gameOver();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBase();
    this.player.draw(this.ctx);
    this.enemies.forEach((e) => e.draw(this.ctx));
    this.projectiles.forEach((p) => p.draw(this.ctx));
  }

  drawBase() {
    const groundHeight = 20;
    const yPos = this.canvas.height - groundHeight;
    this.ctx.fillStyle = "#3e2723";
    this.ctx.fillRect(0, yPos, this.canvas.width, groundHeight);

    const healthWidth =
      (this.baseHealth / this.baseMaxHealth) * this.canvas.width;
    this.ctx.fillStyle = this.baseHealth > 30 ? "#4caf50" : "#f44336";
    this.ctx.fillRect(0, yPos, healthWidth, 5);
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

new Game();
