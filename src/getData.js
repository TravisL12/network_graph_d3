function randomizer(max = 1, min = 0) {
  return Math.round(Math.random() * (max - min) + min);
}

const buildNode = (num) => {
  const children = [];
  for (let i = 0; i < num; i++) {
    const id = randomizer(1000, 1);
    const child =
      id > 800
        ? { id, children: buildNode(randomizer(6, 1)) }
        : { id, value: id };
    children.push(child);
  }
  return children;
};

export const buildHiearchy = () => {
  const count = randomizer(10, 5);
  const data = { id: "gyan", children: buildNode(count) };
  return data;
};
