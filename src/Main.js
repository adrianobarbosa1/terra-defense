import { Enemy } from "./Enemy.js";
import { ENEMY_TYPES } from "./EnemyData.js";
import { LEVELS } from "./LevelData.js";
import { Particle } from "./Particle.js";
import { Player } from "./Player.js";
import { Projectile } from "./Projectile.js";
import { Turret } from "./Turret.js";
import { WEAPONS_DB } from "./WeaponData.js";

class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.canvas.width = 600;
    this.canvas.height = 800;
    this.isGameOver = false;
    this.currentLevelIndex = 0;
    this.enemyIndexInLevel = 0;
    this.isLevelTransitioning = false;
    this.xp = 0;
    this.xpNextLevel = 100;
    this.level = 1;
    this.inventory = []; // Armas instaladas [{tipo: 'RAIO', level: 1}]
    this.particles = [];

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

  resize() {
    // Ajusta a resolução interna do canvas para o tamanho real da janela
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Recalcula a posição do player para não ficar flutuando ou enterrado
    if (this.player) {
      this.player.x = this.canvas.width / 2;
      this.player.y = this.canvas.height - 60; // 60px acima do fundo
    }
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
    // Garanta que o player nasça no lugar certo
    this.player = new Player(this.canvas.width, this.canvas.height);
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height - 50;

    // Criamos a fila de inimigos para a fase atual
    this.prepareLevel();

    // Atualiza a UI para o estado inicial
    document.getElementById("health").innerText = this.baseHealth;
    document.getElementById("score").innerText = this.score;
    document.getElementById("game-over-screen").style.display = "none";
    this.player = new Player(this.canvas.width, this.canvas.height);
  }

  // Transforma o objeto {BESOURO: 5} em um array real para o jogo processar
  prepareLevel() {
    const level = LEVELS[this.currentLevelIndex];
    this.enemyQueue = []; // Fila de inimigos pendentes

    for (const [tipo, quantidade] of Object.entries(level.horda)) {
      for (let i = 0; i < quantidade; i++) {
        this.enemyQueue.push(tipo);
      }
    }

    // Opcional: Embaralha os inimigos para não virem todos do mesmo tipo em sequência
    this.enemyQueue.sort(() => Math.random() - 0.5);

    console.log(
      `Iniciando ${level.nome}. Total de inimigos: ${this.enemyQueue.length}`
    );
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

  addXP(amount) {
    this.xp += amount;
    if (this.xp >= this.xpNextLevel) {
      this.levelUp();
    }
    this.updateUI();
  }

  levelUp() {
    this.isGameOver = true; // Pausa o jogo
    this.xp -= this.xpNextLevel;
    this.level++;
    this.xpNextLevel = Math.floor(this.xpNextLevel * 1.5);

    this.showLevelUpScreen();
  }

  showLevelUpScreen() {
    const modal = document.getElementById("level-up-modal");
    const container = document.getElementById("weapon-options");
    container.innerHTML = "";
    modal.style.display = "flex";

    const keys = Object.keys(WEAPONS_DB);
    const shuffled = keys.sort(() => 0.5 - Math.random()).slice(0, 3);

    shuffled.forEach((key) => {
      const weapon = WEAPONS_DB[key];

      // Criar o quadro
      const card = document.createElement("div");
      card.className = "weapon-card";

      // Criar um canvas para o ícone geométrico
      const iconCanvas = document.createElement("canvas");
      iconCanvas.width = 100;
      iconCanvas.height = 100;
      iconCanvas.className = "weapon-icon-canvas";
      this.drawWeaponIcon(iconCanvas, key); // Função que desenha a forma

      card.appendChild(iconCanvas);
      card.innerHTML += `<strong>${weapon.nome}</strong><small>${weapon.descricao}</small>`;

      card.onclick = () => this.selectWeapon(key);
      container.appendChild(card);
    });
  }

  // Desenha formas geométricas diferentes para cada tipo
  drawWeaponIcon(canvas, type) {
    const ctx = canvas.getContext("2d");
    const color = WEAPONS_DB[type].cor;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;

    switch (type) {
      case "RAIO": // Um raio (z-shape)
        ctx.beginPath();
        ctx.moveTo(50, 20);
        ctx.lineTo(30, 60);
        ctx.lineTo(50, 60);
        ctx.lineTo(40, 90);
        ctx.stroke();
        break;
      case "COLMEIA": // Vários círculos pequenos
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.arc(
            30 + Math.random() * 40,
            30 + Math.random() * 40,
            5,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        break;
      case "AEROEXPLOSAO": // Triângulo apontando para cima (explosão em cone)
        ctx.beginPath();
        ctx.moveTo(50, 20);
        ctx.lineTo(80, 80);
        ctx.lineTo(20, 80);
        ctx.closePath();
        ctx.stroke();
        break;
      default: // Quadrado padrão
        ctx.strokeRect(30, 30, 40, 40);
    }
  }

  selectWeapon(key) {
    // Verifica se já possui essa arma
    const existingTurret = this.inventory.find((t) => t.weaponKey === key);

    if (existingTurret) {
      existingTurret.level++; // Sobe o nível se já existe
    } else {
      // Cria uma nova torreta no próximo slot disponível
      const newTurret = new Turret(
        this.player.x,
        this.player.y,
        key,
        this.inventory.length
      );
      this.inventory.push(newTurret);
    }

    document.getElementById("level-up-modal").style.display = "none";
    this.isGameOver = false;
  }

  update() {
    if (this.isGameOver) return;

    const currentLevel = LEVELS[this.currentLevelIndex];
    this.spawnTimer++;

    // 1. SPAWN DE INIMIGOS
    if (this.enemyQueue.length > 0) {
      if (this.spawnTimer > currentLevel.spawnRate) {
        const enemyKey = this.enemyQueue.shift();
        const config = ENEMY_TYPES[enemyKey];
        this.enemies.push(new Enemy(this.canvas.width, config));
        this.spawnTimer = 0;
      }
    } else if (this.enemies.length === 0 && !this.isLevelTransitioning) {
      this.nextLevel();
    }

    // 2. BUSCA DE ALVO (Única para todas as armas)
    const target = this.getClosestEnemy();

    // 3. ARMA PRINCIPAL (Player)
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

    // 4. ARMAS SECUNDÁRIAS (Turrets)
    this.inventory.forEach((turret) => {
      // A classe Turret já cuida do seu próprio timer e disparo
      turret.update(this.player.x, this.player.y, target, this.projectiles);
    });

    // 5. MOVIMENTAÇÃO DOS PROJÉTEIS
    this.projectiles.forEach((p, pIndex) => {
      p.update();
      if (p.y < 0 || p.x < 0 || p.x > this.canvas.width) {
        this.projectiles.splice(pIndex, 1);
      }
    });

    this.particles.forEach((p, index) => {
      p.update();
      if (p.alpha <= 0) {
        this.particles.splice(index, 1);
      }
    });

    // 6. COLISÕES E INIMIGOS
    this.enemies.forEach((enemy, eIndex) => {
      enemy.update();

      // Colisão com o chão
      if (enemy.y + enemy.radius >= this.canvas.height - 20) {
        this.enemies.splice(eIndex, 1);
        this.baseHealth -= enemy.danoNaBase;
        this.updateUI(); // Atualiza a barra de vida e XP
        if (this.baseHealth <= 0) {
          this.baseHealth = 0;
          this.gameOver();
        }
        return;
      }

      // Colisão Projétil -> Inimigo
      this.projectiles.forEach((p, pIndex) => {
        const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
        if (dist < enemy.radius + p.radius + 5) {
          this.projectiles.splice(pIndex, 1);
          enemy.health -= 500;

          if (enemy.health <= 0) {
            this.enemies.splice(eIndex, 1);
            this.score += 10;
            this.addXP(25);

            document.getElementById("score").innerText = this.score;

            // CRIAR PARTÍCULAS AQUI
            for (let i = 0; i < 15; i++) {
              this.particles.push(new Particle(enemy.x, enemy.y, enemy.color));
            }
          }
        }
      });
    });
  }

  fireSecondaryWeapon(weapon, slotIndex) {
    const data = WEAPONS_DB[weapon.id];
    const target = this.getClosestEnemy();
    if (!target) return;

    // Posição visual ao lado do canhão principal
    const offsetX = (slotIndex + 1) * 40 * (slotIndex % 2 === 0 ? 1 : -1);

    // Aqui você cria lógicas diferentes por tipo
    if (weapon.id === "COLMEIA") {
      for (let i = 0; i < data.quantidade; i++) {
        // Lógica de vespas (projéteis rápidos e aleatórios)
        this.projectiles.push(
          new Projectile(
            this.player.x + offsetX,
            this.player.y,
            target.x + (Math.random() * 50 - 25),
            target.y,
            data.cor
          )
        );
      }
    } else {
      this.projectiles.push(
        new Projectile(
          this.player.x + offsetX,
          this.player.y,
          target.x,
          target.y,
          data.cor
        )
      );
    }
  }

  updateUI() {
    const xpPercent = (this.xp / this.xpNextLevel) * 100;
    document.getElementById("xp-bar").style.width = xpPercent + "%";
    document.getElementById("lvl-display").innerText = this.level;
    document.getElementById("health").innerText = this.baseHealth;
    document.getElementById("score").innerText = this.score;
  }

  nextLevel() {
    if (this.currentLevelIndex < LEVELS.length - 1) {
      this.isLevelTransitioning = true;

      // Feedback visual simples no console (podemos por na tela depois)
      console.log("FASE CONCLUÍDA!");

      setTimeout(() => {
        this.currentLevelIndex++;
        this.prepareLevel(); // Prepara a nova fila da próxima fase
        this.spawnTimer = 0;
        this.isLevelTransitioning = false;
      }, 3000);
    } else {
      this.gameOver();
    }
  }

  draw() {
    // Limpa o canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Desenha o cenário (Base e Chão)
    this.drawBase();

    // 2. Desenha o Player (Canhão Principal)
    this.player.draw(this.ctx);

    // 3. Desenha as Armas Secundárias (Torretas)
    this.inventory.forEach((turret) => {
      turret.draw(this.ctx, this.player.x, this.player.y);
    });

    // 4. Desenha Inimigos e Projéteis
    this.enemies.forEach((e) => e.draw(this.ctx));
    this.projectiles.forEach((p) => p.draw(this.ctx));

    // 5. Desenha Partículas
    this.particles.forEach((p) => p.draw(this.ctx));
  }

  drawBase() {
    const groundHeight = 25;
    const yPos = this.canvas.height - groundHeight;

    // Chão marrom ocupando 100% da largura do canvas
    this.ctx.fillStyle = "#3e2723";
    this.ctx.fillRect(0, yPos, this.canvas.width, groundHeight);

    // Linha de grama ou topo da base
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
