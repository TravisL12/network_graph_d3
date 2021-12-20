import * as d3 from "d3";

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
            children: buildNode(randomizer(4, 2), false, level + 1),
            color: getColor(),
          }
        : { id, value: id };
    children.push(child);
  }
  return children;
};

export const buildHiearchy = () => {
  return { id: "Gyan", children: buildNode(4, true), color: "magenta" };
};

/**
 * example data type node
 *  {
    "Parent Node Id": 17157714,
    "Parent Node Name": "Planet",
    "Child Node Id": 17157715,
    "Child Node Name": "Earth",
    "Root Node Id": 17157714,
    "Root Node Name": "Planets",
    "Relationship Definition": "",
    "Relationship Identity": "TOC",
    "TOC Sequence": 0,
    "Friendly Name": "Elaboration"
  },
 */

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

export const buildGyanStratify = (data) => {
  const newData = data.map((d) => {
    const newD = {};
    Object.keys(d).forEach((key) => {
      newD[keys[key]] = d[key];
    });
    return newD;
  });

  const nodes = {};

  // Compute the distinct nodes from the links.
  newData.forEach(function (link) {
    link.source = nodes[link.parent_id] || (nodes[link.parent_id] = link);
    link.target = nodes[link.child_id] || (nodes[link.child_id] = link);
  });

  return { nodes, links: newData };
  // const root = {
  //   parent_id: "",
  //   parent_name: "",
  //   child_id: newData[0].root_id,
  //   child_name: "",
  //   root_id: "",
  //   root_name: "",
  //   relationship_definition: "",
  //   relationship_identity: "",
  //   toc_sequence: "",
  //   friendly_name: "",
  // };

  // const strat = d3
  //   .stratify()
  //   .id((d) => d.child_id)
  //   .parentId((d) => d.parent_id);
  // return strat([root, ...dataSlice]);
};

export const buildGyanData = (data) => {
  const output = {};

  data.forEach((origD) => {
    const d = Object.keys(origD).reduce((acc, key) => {
      acc[keys[key]] = origD[key];
      return acc;
    }, {});
    if (!output[d.parent_id]) {
      output[d.parent_id] = { ...d, children: [] };
    }
    output[d.parent_id].children.push(d);
  });

  return output;
};
