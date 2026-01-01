// src/Turret.js
import { WEAPONS_DB } from "../data/WeaponData.js";
import { Projectile } from "./Projectile.js";

export class Turret {
  constructor(playerX, playerY, weaponKey, slotIndex) {
    this.weaponKey = weaponKey;
    this.data = WEAPONS_DB[weaponKey];
    this.level = 1;
    this.timer = 0;

    // Define a posição baseada no slot (alternando esquerda e direita)
    this.offsetX =
      (Math.floor(slotIndex / 2) + 1) * 45 * (slotIndex % 2 === 0 ? -1 : 1);
    this.offsetY = 10;
  }

  update(playerX, playerY, target, projectiles) {
    this.timer++;

    // Cooldown melhora com o level
    const cooldown = this.data.esperaBase / (1 + (this.level - 1) * 0.25);

    if (this.timer >= cooldown && target) {
      this.fire(
        playerX + this.offsetX,
        playerY + this.offsetY,
        target,
        projectiles
      );
      this.timer = 0;
    }
  }

  fire(x, y, target, projectiles) {
    // Comportamentos diferentes por tipo de arma
    if (this.weaponKey === "COLMEIA") {
      // Atira vários projéteis pequenos e rápidos
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
      // O raio atira um projétil muito rápido (laser)
      projectiles.push(
        new Projectile(x, y, target.x, target.y, this.data.cor, 15)
      );
    } else {
      // Tiro padrão para outras armas
      projectiles.push(new Projectile(x, y, target.x, target.y, this.data.cor));
    }
  }

  draw(ctx, playerX, playerY) {
    const x = playerX + this.offsetX;
    const y = playerY + this.offsetY;

    ctx.save();
    ctx.translate(x, y);

    // Desenha a base da torreta (forma geométrica)
    ctx.fillStyle = this.data.cor;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    if (this.weaponKey === "RAIO") {
      // Torreta em forma de Losango
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(10, 0);
      ctx.lineTo(0, 15);
      ctx.lineTo(-10, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.weaponKey === "COLMEIA") {
      // Torreta em forma de Hexágono
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
      // Quadrado para Aeroexplosão
      ctx.fillRect(-10, -10, 20, 20);
      ctx.strokeRect(-10, -10, 20, 20);
    }

    // Indicador de Nível
    ctx.fillStyle = "white";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`L${this.level}`, 0, 25);
    ctx.restore();
  }
}
