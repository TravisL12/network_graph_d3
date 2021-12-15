import * as d3 from "d3";

function randomizer(max = 1, min = 0) {
  return Math.round(Math.random() * (max - min) + min);
}

const colors = d3.schemeCategory10;

const getColor = () => {
  const idx = randomizer(colors.length - 1);
  return colors[idx];
};

const buildNode = (num) => {
  const children = [];
  for (let i = 0; i < num; i++) {
    const id = randomizer(1000, 1);
    const child =
      id > 850
        ? { id, children: buildNode(randomizer(6, 1)), color: getColor() }
        : { id, value: id };
    children.push(child);
  }
  return children;
};

export const buildHiearchy = () => {
  const count = randomizer(10, 5);
  return { id: "gyan", children: buildNode(count), color: "magenta" };
};
