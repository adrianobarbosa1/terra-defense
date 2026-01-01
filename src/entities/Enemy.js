// src/Enemy.js
export class Enemy {
  constructor(canvasWidth, config) {
    this.nome = config.nome;
    this.radius = config.radius || 15;
    this.x = Math.random() * (canvasWidth - 40) + 20;
    this.y = -10;

    // Atributos vindo do JSON
    this.speed = config.velocidade;
    this.health = config.vidaTotal;
    this.maxHealth = config.vidaTotal;
    this.color = config.cor;
    this.danoNaBase = config.danoNaBase;
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx) {
    ctx.save();
    // Sombra para dar profundidade
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(0,0,0,0.5)";

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();

    // Barra de vida proporcional
    const barWidth = this.radius * 2;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(this.x - this.radius, this.y - this.radius - 10, barWidth, 5);

    ctx.fillStyle = "#00ff00";
    const healthBar = (this.health / this.maxHealth) * barWidth;
    ctx.fillRect(this.x - this.radius, this.y - this.radius - 10, healthBar, 5);

    ctx.restore();
  }
}
