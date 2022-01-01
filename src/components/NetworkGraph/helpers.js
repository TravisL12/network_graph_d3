// https://bl.ocks.org/emeeks/c2822e1067ff91abe24e
export const positionLink = (d) => {
  console.log(d);
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  // return `M${d.source.x},${d.source.y} L ${d.target.x},${d.target.y}`; // straight line
  return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
};

export const getHeightWidth = () => {
  const g = document.body;
  const width = g.clientWidth;
  const height = g.clientHeight;
  return { width, height };
};
