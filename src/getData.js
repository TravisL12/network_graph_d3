function randomizer(max = 1, min = 0) {
  return Math.round(Math.random() * (max - min) + min);
}

const childMax = 4;

const buildNodes = (parentNode, nodes = [], links = [], level = 0) => {
  const kids = [];
  for (let j = 0; j < childMax + level; j++) {
    const childNode = { id: randomizer(10000) };
    const link = {
      source: parentNode.id,
      target: childNode.id,
    };
    kids.push(childNode);
    nodes.push(childNode);
    links.push(link);
  }

  if (level < 1) {
    kids.forEach((kid) => {
      buildNodes(kid, nodes, links, level + 1);
    });
  }

  return { nodes, links };
};

export const buildNetworkData = () => {
  const parentNode = { id: randomizer(10000) };
  const { nodes, links } = buildNodes(parentNode, [parentNode]);

  return { nodes, links };
};
