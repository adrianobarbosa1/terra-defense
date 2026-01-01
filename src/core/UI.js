// src/core/UI.js
export class UI {
  constructor() {
    this.xpBar = document.getElementById("xp-bar");
    this.healthDisplay = document.getElementById("health");
    this.scoreDisplay = document.getElementById("score");
    this.lvlDisplay = document.getElementById("lvl-display");
    this.finalScore = document.getElementById("final-score");
    this.weaponContainer = document.getElementById("weapon-options");
  }

  updateStats(health, score, level) {
    this.healthDisplay.innerText = health;
    this.scoreDisplay.innerText = score;
    this.lvlDisplay.innerText = level;
  }

  updateXP(current, next) {
    const percent = (current / next) * 100;
    this.xpBar.style.width = `${percent}%`;
  }

  showLevelUp(options, onSelect, drawIconCallback) {
    this.weaponContainer.innerHTML = "";
    this.showModal("level-up-modal", "flex");

    options.forEach((key) => {
      const card = document.createElement("div");
      card.className = "weapon-card";

      const iconCanvas = document.createElement("canvas");
      iconCanvas.width = 100;
      iconCanvas.height = 100;
      iconCanvas.className = "weapon-icon-canvas";

      // Chamamos o callback de desenho que está no Game
      drawIconCallback(iconCanvas, key);

      card.appendChild(iconCanvas);
      card.innerHTML += `<strong>${key}</strong>`; // Aqui você pode buscar no DB o nome real

      card.onclick = () => {
        onSelect(key);
        this.hideModal("level-up-modal");
      };
      this.weaponContainer.appendChild(card);
    });
  }

  showGameOver(score) {
    this.finalScore.innerText = score;
    this.showModal("game-over-screen", "block");
  }

  showModal(id, display) {
    document.getElementById(id).style.display = display;
  }

  hideModal(id) {
    document.getElementById(id).style.display = "none";
  }
}
