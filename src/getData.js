import { LoremIpsum } from "lorem-ipsum";
import { groupBy, uniqBy } from "lodash";

const colors = [
  "#1AB4D2",
  "#EF821E",
  "#6FA9D7",
  "#FF6D41",
  "#31449A",
  "#E12A1F",
  "#C61574",
  "#A21D27",
  "#A24C90",
  "#C39B6D",
  "#705193",
  "#F3BA1E",
];

const darkColors = [
  "#1389A0",
  "#B06014",
  "#5580A5",
  "#B45030",
  "#233075",
  "#A61C17",
  "#940558",
  "#82111A",
  "#7B366E",
  "#927652",
  "#533971",
  "#B28A13",
];

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

const keys = {
  "Parent Node Id": "parent_id",
  "Parent Node Name": "parent_name",
  "Child Node Id": "child_id",
  "Child Node Name": "child_name",
  "Root Node Id": "root_id",
  "Root Node Name": "root_name",
  "Relationship Definition": "relationship_definition",
  "Relationship Identity": "relationship_identity",
  "TOC Sequence": "toc_sequence",
  "Friendly Name": "friendly_name",
};

export const buildGyanData = (data) => {
  const values = data.map((v) =>
    Object.keys(v).reduce((acc, key) => {
      acc[keys[key]] = v[key];
      return acc;
    }, {})
  );

  const vals = groupBy(values, "parent_id");
  const childVals = groupBy(values, "child_id");
  const nodes = [];
  const links = [];

  // create nodes
  [...Object.entries(childVals), ...Object.entries(vals)]
    .filter(([id]) => id)
    .forEach(([id, v]) => {
      const color = getColor();
      const isRoot = id == v[0].root_id;
      nodes.push({
        id,
        name: v[0].parent_name,
        color: isRoot ? "magenta" : color,
        isRoot,
        x: randomizer(800, 250),
        y: randomizer(800, 250),
      });
      v.forEach((child) => {
        const childId =
          child.toc_sequence !== ""
            ? `${id}-${child.toc_sequence}`
            : String(child.child_id);

        if (child.toc_sequence !== "") {
          nodes.push({
            id: childId,
            name: child.child_name,
            color,
            isRoot,
            x: randomizer(800, 250),
            y: randomizer(800, 250),
          });
        }
      });
    });

  [...Object.entries(childVals), ...Object.entries(vals)].forEach(([id, v]) => {
    v.forEach((child) => {
      const childId =
        child.toc_sequence !== ""
          ? `${id}-${child.toc_sequence}`
          : String(child.child_id);

      if (child.child_id && id != childId) {
        links.push({ source: String(id), target: childId, color: getColor() });
      }
    });
  });
  return {
    nodes: uniqBy(nodes, "id"),
    links: uniqBy(links, (d) => `${d.source}-${d.target}`),
  };
};
