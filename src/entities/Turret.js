// src/Turret.js
import { WEAPONS_DB } from "../data/WeaponData.js";
import { Projectile } from "./Projectile.js";

export class Turret {
  constructor(x, y, weaponKey) {
    this.x = x;
    this.y = y;
    this.weaponKey = weaponKey;
    this.data = WEAPONS_DB[weaponKey];
    this.level = 1;
    this.timer = 0;
  }

  // O método getClosestEnemy agora é passado como um argumento
  update(getClosestEnemy, projectiles) {
    this.timer++;

    const cooldown = this.data.esperaBase / (1 + (this.level - 1) * 0.25);

    // Precisamos encontrar o alvo mais próximo a partir da *posição da torreta*
    const target = getClosestEnemy(this.x, this.y);

    if (this.timer >= cooldown && target) {
      this.fire(this.x, this.y, target, projectiles);
      this.timer = 0;
    }
  }

  fire(x, y, target, projectiles) {
    if (this.weaponKey === "COLMEIA") {
      for (let i = 0; i < 5; i++) {
        projectiles.push(
          new Projectile(
            x,
            y,
            target.x + (Math.random() * 60 - 30),
            target.y,
            this.data.cor
          )
        );
      }
    } else if (this.weaponKey === "RAIO") {
      projectiles.push(
        new Projectile(x, y, target.x, target.y, this.data.cor, 15)
      );
    } else {
      projectiles.push(new Projectile(x, y, target.x, target.y, this.data.cor));
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.fillStyle = this.data.cor;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    if (this.weaponKey === "RAIO") {
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(10, 0);
      ctx.lineTo(0, 15);
      ctx.lineTo(-10, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.weaponKey === "COLMEIA") {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        ctx.lineTo(
          12 * Math.cos((i * Math.PI) / 3),
          12 * Math.sin((i * Math.PI) / 3)
        );
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(-10, -10, 20, 20);
      ctx.strokeRect(-10, -10, 20, 20);
    }
    
    ctx.fillStyle = "white";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`L${this.level}`, 0, 25);
    ctx.restore();
  }
}
