export class Player {
  constructor(canvasWidth, canvasHeight) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 30;
    this.health = 10;
    this.color = "#4df3ff";
    this.fireRate = 30; // Atira a cada 30 frames
    this.fireTimer = 0;
  }

  draw(ctx) {
    ctx.save();
    // Base
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(this.x - 30, this.y + 20);
    ctx.lineTo(this.x + 30, this.y + 20);
    ctx.lineTo(this.x + 20, this.y - 10);
    ctx.lineTo(this.x - 20, this.y - 10);
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.stroke();

    // Canhão
    ctx.beginPath();
    ctx.arc(this.x, this.y - 10, 15, 0, Math.PI, true);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}
