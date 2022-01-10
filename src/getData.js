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

export function randomizer(max = 1, min = 0) {
  return Math.round(Math.random() * (max - min) + min);
}

let colorIdx = 0;
export const getColor = () => {
  const c = colors[colorIdx % (colors.length - 1)];
  colorIdx += 1;
  return c;
};

export const generateNodes = (root, color, num = 1) => {
  const nodes = [];
  const links = [];
  root.childCount = num;
  for (let i = 0; i < num; i++) {
    const id = randomizer(1000000, 1);
    const node = {
      id,
      name: lorem.generateWords(2),
      color: color || root.color,
      childCount: num,
    };

    node.x = root?.x;
    node.y = root?.y;

    nodes.push(node);
    links.push({
      target: node,
      source: root,
      color: root.color,
    });
  }

  return { nodes, links };
};

const childLevels = 1;
const generateChild = (nodes, level = 0) => {
  let nodesData = [];
  let linksData = [];
  const theta = (2 * Math.PI) / nodes.length;

  nodes.forEach((node, i) => {
    node.isParent = true;
    const childCount = level > 0 ? level + 1 : randomChildCount();
    if (level === 0) {
      node.color = getColor();
      node.x = Math.cos(i * theta); // random node spawn position
      node.y = Math.sin(i * theta); // random node spawn position
    } else {
      node.level = level * 10 + node.childCount; // orbit distance
    }

    const children = generateNodes(node, node.color, childCount);
    if (level < childLevels) {
      const [n2, l2] = generateChild([children.nodes[0]], level + 1);
      nodesData = nodesData.concat(n2);
      linksData = linksData.concat(l2);
    }
    nodesData = nodesData.concat(children.nodes);
    linksData = linksData.concat(children.links);
  });

  return [nodesData, linksData];
};

const childNodes = 30;
const randomChildCount = () => randomizer(15, 5);
export const simpleData = () => {
  const root = {
    id: 1500,
    name: "Gyan",
    color: "magenta",
    isParent: true,
    isRoot: true,
  };

  let { nodes, links } = generateNodes(root, root.color, childNodes);

  const [nodesData, linksData] = generateChild(nodes);

  return {
    nodes: [root, ...nodes, ...nodesData],
    links: [...links, ...linksData],
  };
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
  const nodes = [];
  const links = [];
  Object.entries(vals).forEach(([id, v]) => {
    nodes.push({
      id,
      name: v[0].parent_name,
    });
    v.forEach((child) => {
      links.push({ source: +id, target: child.child_id });
    });
  });
  return {
    nodes: uniqBy(nodes, "id"),
    links: uniqBy(links, (d) => `${d.source}-${d.target}`),
  };
};
