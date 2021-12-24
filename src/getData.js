import * as d3 from "d3";
import { LoremIpsum } from "lorem-ipsum";

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

lorem.generateWords(1);

export function randomizer(max = 1, min = 0) {
  return Math.round(Math.random() * (max - min) + min);
}

const colors = d3.schemeCategory10;

const getColor = () => {
  const idx = randomizer(colors.length - 1);
  return colors[idx];
};

export const buildNode = (num, allNodes = false, level = 0) => {
  const children = [];
  for (let i = 0; i < num; i++) {
    const id = randomizer(1000, 1);
    const child =
      (id > 850 && level < 1) || allNodes
        ? {
            id,
            name: lorem.generateWords(2),
            children: buildNode(randomizer(4, 2), false, level + 1),
            color: getColor(),
          }
        : { id, name: lorem.generateWords(1) };
    children.push(child);
  }
  return children;
};

export const buildHiearchy = () => {
  return {
    id: "Gyan",
    name: "Gyan",
    children: buildNode(4, true),
    color: "magenta",
  };
};
