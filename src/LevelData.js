// src/LevelData.js
export const LEVELS = [
  {
    id: 1,
    nome: "FASE-1A: Reconhecimento",
    horda: {
      BESOURO: 5,
      FERRAO: 2,
    },
    spawnRate: 100,
  },
  {
    id: 2,
    nome: "FASE-1A: Inicio da invasão",
    horda: {
      FERRAO: 15,
      BESOURO: 10,
      DRONE: 2,
    },
    spawnRate: 80,
  },
  {
    id: 3,
    nome: "FASE-1A: Cerco Rebelde",
    horda: {
      DRONE: 20,
      ESCAVADOR: 5,
    },
    spawnRate: 60,
  },
];
