// src/data/LevelData.js
export const PHASES = {
  "Fase 1": [
    {
      id: 1,
      nome: "Wave 1",
      horda: {
        BESOURO: 5,
        FERRAO: 2,
      },
      spawnRate: 100,
    },
    {
      id: 2,
      nome: "Wave 2",
      horda: {
        FERRAO: 15,
        BESOURO: 10,
        DRONE: 2,
      },
      spawnRate: 80,
    },
    {
      id: 3,
      nome: "Wave 3",
      horda: {
        DRONE: 20,
        ESCAVADOR: 5,
      },
      spawnRate: 60,
    },
  ],
  "Fase 2": [
    {
      id: 1,
      nome: "Wave 1",
      horda: {
        BESOURO: 15,
        DRONE: 5,
      },
      spawnRate: 90,
    },
    {
      id: 2,
      nome: "Wave 2",
      horda: {
        ESCAVADOR: 10,
        FERRAO: 10,
      },
      spawnRate: 70,
    },
    {
      id: 3,
      nome: "Wave 3",
      horda: {
        DRONE: 15,
        ESCAVADOR: 5,
        FERRAO: 10,
      },
      spawnRate: 50,
    },
  ],
};
