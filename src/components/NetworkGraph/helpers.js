// https://bl.ocks.org/emeeks/c2822e1067ff91abe24e
// `M${d.source.x},${d.source.y} L ${d.target.x},${d.target.y}` // straight line
export const positionLink = (d) => {
  const dx = d.target.x - d.source.x;
  const dy = d.target.y - d.source.y;
  const curveRate = d.source.depth === 0 ? 1.4 : 0.6; // smaller curve rate makes curvier lines
  const dr = Math.sqrt(dx * dx + dy * dy) * curveRate;
  const link = `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;

  return link;
};

export const getHeightWidth = () => {
  const g = document.body;
  const width = g.clientWidth;
  const height = g.clientHeight;
  return { width, height };
};
