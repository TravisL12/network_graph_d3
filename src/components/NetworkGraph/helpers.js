import * as d3 from "d3";
import {
  CIRCLE_BASE_RADIUS,
  LINK_DISTANCE,
  ARM_STRENGTH,
  ARM_MAX_DISTANCE,
  LINK_STRENGTH,
  COLLIDE_DISTANCE,
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

const linkDistance = (d) => {
  return d.isRoot
    ? LINK_DISTANCE * 5
    : d.isParent
    ? LINK_DISTANCE * 1
    : LINK_DISTANCE * 0.2;
};

// GOOD
// makes circles around parent nodes
const linkStrength = (d) => {
  return d.target.isParent ? 0 : 0.2;
};

// adjust distance
const forceBodyStrength = (d) => {
  return d.isParent ? 0 : Math.round(d.childCount * -0.3);
};

const collideDistance = (d) => {
  return d.isRoot
    ? CIRCLE_BASE_RADIUS * 5
    : d.isParent
    ? CIRCLE_BASE_RADIUS * 2
    : CIRCLE_BASE_RADIUS * 1.1;
};

export const buildSimulation = ({ height, width }) => {
  return d3
    .forceSimulation()
    .force(
      "link",
      d3
        .forceLink()
        .id(({ id }) => id)
        .distance(linkDistance)
        .strength(linkStrength)
    )
    .force("charge", d3.forceManyBody().strength(forceBodyStrength))
    .force("collision", d3.forceCollide(collideDistance))
    .force("center", d3.forceCenter(width / 2, height / 2));
};

export const hoverCircleCheck = (isHovered, r) => {
  return isHovered ? r * 2 : r;
};
