export class Projectile {
  constructor(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.radius = 8;
    this.color = "#4df3ff";

    const angle = Math.atan2(targetY - y, targetX - x);
    this.velocity = {
      x: Math.cos(angle) * 7,
      y: Math.sin(angle) * 7,
    };
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}
