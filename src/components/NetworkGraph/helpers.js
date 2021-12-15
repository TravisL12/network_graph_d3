import * as d3 from "d3";

// https://bl.ocks.org/emeeks/c2822e1067ff91abe24e
export const positionLink = (d) => {
  const dx = d.target.x - d.source.x;
  const dy = d.target.y - d.source.y;
  const curveRate = 1; // smaller curve rate makes curvier lines
  const dr = Math.sqrt(dx * dx + dy * dy) * curveRate;
  return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
};

export const getHeightWidth = () => {
  const g = document.body;
  const width = g.clientWidth;
  const height = g.clientHeight;
  return { width, height };
};

export const getColors = (data) =>
  d3.scaleOrdinal(d3.schemeCategory10).domain(data.nodes.map(({ id }) => id));
