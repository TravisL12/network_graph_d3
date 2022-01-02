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

export function randomizer(max = 1, min = 0) {
  return Math.round(Math.random() * (max - min) + min);
}

export const getColor = () => {
  return colors[randomizer(colors.length - 1)];
};

export const generateNodes = (root, color) => {
  const nodes = [];
  const links = [];
  for (let i = 0; i < 4; i++) {
    const id = randomizer(1000, 1);
    const node = {
      id,
      name: lorem.generateWords(2),
      color: color || root.color,
    };

    if (root.x && root.y) {
      node.x = root.x;
      node.y = root.y;
    }

    nodes.push(node);
    links.push({ target: node.id, source: root.id });
  }
  return { nodes, links };
};

export const simpleData = () => {
  const root = {
    id: 1500,
    name: "Gyan",
    color: "magenta",
    isParent: true,
  };

  const { nodes, links } = generateNodes(root);
  return { nodes: [root, ...nodes], links };
};
