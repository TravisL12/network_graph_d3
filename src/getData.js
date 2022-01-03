import * as d3 from "d3";
import { LoremIpsum } from "lorem-ipsum";

const colors = d3.schemeCategory10;
const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

function weightRandomizer() {
  const weighting = [1, 1, 1, 1, 1, 8, 8, 8, 8, 8, 15, 15, 15, 30];
  const idx = randomizer(weighting.length - 1);
  return weighting[idx];
}

export function randomizer(max = 1, min = 0) {
  return Math.round(Math.random() * (max - min) + min);
}

export const getColor = () => {
  return colors[randomizer(colors.length - 1)];
};

export const generateNodes = (root, color) => {
  const nodes = [];
  const links = [];
  for (let i = 0; i < 3; i++) {
    const id = randomizer(1000, 1);
    const node = {
      id,
      name: lorem.generateWords(2),
      color: color || root.color,
    };

    node.x = root.x || randomizer(800, 250); // random node spawn position
    node.y = root.y || randomizer(800, 250); // random node spawn position

    nodes.push(node);
    links.push({
      target: node.id,
      source: root.id,
      weight: weightRandomizer(),
    });
  }
  return { nodes, links };
};

export const simpleData = () => {
  const root = {
    id: 1500,
    name: "Gyan",
    color: "magenta",
    isParent: true,
    isRoot: true,
  };

  const { nodes, links } = generateNodes(root);
  return { nodes: [root, ...nodes], links };
};
