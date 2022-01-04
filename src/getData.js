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

const light = 1;
const mid = 5;
const heavy = 10;
export function weightRandomizer() {
  const lights = new Array(10).fill(light);
  const mids = new Array(0).fill(mid);
  const heavies = new Array(0).fill(heavy);
  const weighting = [...lights, ...mids, ...heavies];
  const idx = randomizer(weighting.length - 1);
  return weighting[idx];
}

export function randomizer(max = 1, min = 0) {
  return Math.round(Math.random() * (max - min) + min);
}

export const getColor = () => {
  return colors[randomizer(colors.length - 1)];
};

export const generateNodes = (root, color, num = 1) => {
  const nodes = [];
  const links = [];
  for (let i = 0; i < num; i++) {
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
      color: root.color,
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
