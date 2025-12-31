export const LEVELS = [
  {
    id: 1,
    nome: "Primeiro Contato",
    inimigos: ["BESOURO", "BESOURO", "FERRAO", "BESOURO"], // Ordem de aparição
    spawnRate: 120, // Velocidade de spawn nesta fase (mais alto = mais lento)
  },
  {
    id: 2,
    nome: "Invasão Insetoide",
    inimigos: ["FERRAO", "FERRAO", "BESOURO", "FERRAO", "DRONE"],
    spawnRate: 90,
  },
  {
    id: 3,
    nome: "A Chegada dos Rebeldes",
    inimigos: ["DRONE", "DRONE", "ESCAVADOR", "BESOURO"],
    spawnRate: 70,
  },
  {
    id: 4,
    nome: "O Despertar do Chefe",
    inimigos: ["MINI_CHEFE"],
    spawnRate: 200,
  },
];
