import * as d3 from "d3";
import {
  COLLISION_DISTANCE,
  LINK_DISTANCE,
  ARM_STRENGTH,
  ARM_MAX_DISTANCE,
  HOVER_RADIUS,
} from "../../constants";

// https://bl.ocks.org/emeeks/c2822e1067ff91abe24e
export const positionLink = (d) => {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y); // curviness
  const curvedLine = `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
  // const straightLine = `M${d.source.x},${d.source.y} L ${d.target.x},${d.target.y}`;
  // return d.target.isParent || d.source.isRoot ? curvedLine : straightLine;
  return curvedLine;
};

export const getHeightWidth = () => {
  const g = document.body;
  const width = g.clientWidth;
  const height = g.clientHeight;
  return { width, height };
};

export const buildSimulation = () => {
  return d3
    .forceSimulation()
    .force(
      "link",
      d3
        .forceLink()
        .id(({ id }) => id)
        .distance((d) => {
          return LINK_DISTANCE * (100 / d.source.childCount);
        })
    )
    .force(
      "charge",
      d3.forceManyBody().strength(ARM_STRENGTH).distanceMax(ARM_MAX_DISTANCE)
    )
    .force("collision", d3.forceCollide(COLLISION_DISTANCE));
};

export const hoverCircleCheck = (isHovered, r) => {
  return isHovered ? r * HOVER_RADIUS : r;
};
