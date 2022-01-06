import * as d3 from "d3";
import {
  CIRCLE_BASE_RADIUS,
  LINK_DISTANCE,
  ARM_STRENGTH,
  ARM_MAX_DISTANCE,
  centerZoom,
} from "../../constants";

// https://bl.ocks.org/emeeks/c2822e1067ff91abe24e
export const positionLink = (d) => {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y); // curviness
  const curvedLine = `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
  const straightLine = `M${d.source.x},${d.source.y} L ${d.target.x},${d.target.y}`;
  // return d.target.isParent || d.source.isRoot ? curvedLine : straightLine;
  return curvedLine;
};

export const getHeightWidth = () => {
  const g = document.body;
  const width = g.clientWidth;
  const height = g.clientHeight;
  return { width, height };
};

export const buildSimulation = ({ height, width }) => {
  return d3
    .forceSimulation()
    .force(
      "link",
      d3
        .forceLink()
        .id(({ id }) => id)
        .distance(LINK_DISTANCE)
        .strength(1)
    )
    .force(
      "charge",
      d3
        .forceManyBody()
        .strength((d) => {
          return d.isRoot
            ? ARM_STRENGTH
            : d.isParent
            ? 2 * ARM_STRENGTH
            : ARM_STRENGTH / 2;
        })
        .distanceMax(ARM_MAX_DISTANCE)
    )
    .force("collision", d3.forceCollide(CIRCLE_BASE_RADIUS * 2))
    .force("center", d3.forceCenter(width / 2, height / 2));
  // .force("radial", d3.forceRadial(1000, centerZoom(width), height / 2))
};

export const hoverCircleCheck = (isHovered, r) => {
  return isHovered ? r * 2 : r;
};
