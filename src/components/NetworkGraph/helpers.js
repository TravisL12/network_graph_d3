import * as d3 from "d3";
import {
  CIRCLE_BASE_RADIUS,
  LINK_DISTANCE,
  ARM_STRENGTH,
  ARM_MAX_DISTANCE,
  LINK_STRENGTH,
  COLLIDE_DISTANCE,
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

const linkDistance = (d) => {
  return d.target.isParent
    ? LINK_DISTANCE * d.source.childCount * 0.2
    : LINK_DISTANCE * 0.1;
};

// GOOD
// makes circles around parent nodes
const linkStrength = (d) => {
  return d.target.isParent ? 0 : 0.2;
};

// adjust distance
const forceBodyStrength = (d) => {
  return d.isParent ? -0.1 : Math.round(d.childCount * -4);
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
    .force(
      "r",
      d3
        .forceRadial(
          (d) => {
            if (d.isParent && !d.isRoot) console.log(d.childCount * 100);
            return d.isRoot
              ? 0
              : d.level
              ? d.level * 50 // outmost level
              : d.isParent
              ? d.childCount * 50 // first parent node
              : d.childCount * 50; // first parent children
          },
          width / 2,
          height / 2
        )
        .strength((d) => {
          console.log(d);
          return d.isParent ? 1 : 0;
        })
    );
};

export const hoverCircleCheck = (isHovered, r) => {
  return isHovered ? r * 2 : r;
};
