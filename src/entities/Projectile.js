// src/Projectile.js
export class Projectile {
  constructor(x, y, targetX, targetY, color = "#4df3ff", speed = 7) {
    this.x = x;
    this.y = y;
    this.radius = 4;
    this.color = color; // Cor recebida da arma
    this.speed = speed;

    const angle = Math.atan2(targetY - y, targetX - x);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    // Adiciona um brilho (glow) na cor do projétil
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0; // Reseta o brilho para não afetar outros desenhos
  }
}
