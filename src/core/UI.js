// src/core/UI.js
export class UI {
  constructor() {
    this.xpBar = document.getElementById("xp-bar");
    this.healthDisplay = document.getElementById("health");
    this.scoreDisplay = document.getElementById("score");
    this.waveDisplay = document.getElementById("wave-display"); // Renomeado de lvl-display
    this.finalScore = document.getElementById("final-score");
    this.weaponContainer = document.getElementById("weapon-options");
    this.levelSelectionScreen = document.getElementById(
      "level-selection-screen"
    );
    this.levelButtonsContainer = document.getElementById(
      "level-buttons-container"
    );
    this.gameCanvas = document.getElementById("gameCanvas");
    this.uiContainer = document.getElementById("ui");
  }

  updateStats(health, score, wave) {
    this.healthDisplay.innerText = health;
    this.scoreDisplay.innerText = score;
    this.waveDisplay.innerText = wave; // Atualiza o display da wave
  }

  updateXP(current, next) {
    const percent = (current / next) * 100;
    this.xpBar.style.width = `${percent}%`;
  }

  createLevelSelection(phases, onSelect) {
    this.levelButtonsContainer.innerHTML = "";
    Object.keys(phases).forEach((phaseKey) => {
      const button = document.createElement("button");
      button.className = "level-button";
      button.innerText = phaseKey; // Usa a chave como nome do botão (ex: "Fase 1")
      button.onclick = () => {
        onSelect(phaseKey);
        this.hideModal("level-selection-screen");
        this.showModal("ui", "block");
        this.showModal("gameCanvas", "block");
      };
      this.levelButtonsContainer.appendChild(button);
    });
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

      drawIconCallback(iconCanvas, key);

      card.appendChild(iconCanvas);
      card.innerHTML += `<strong>${key}</strong>`;

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

  showModal(id, display = "block") {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = display;
    }
  }

  hideModal(id) {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = "none";
    }
  }
}
