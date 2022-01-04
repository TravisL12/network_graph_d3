import * as d3 from "d3";
import { randomizer } from "../../getData";
import {
  COLLISION_DISTANCE,
  LINK_DISTANCE,
  ARM_STRENGTH,
  ARM_MAX_DISTANCE,
} from "../../constants";

// https://bl.ocks.org/emeeks/c2822e1067ff91abe24e
// return `M${d.source.x},${d.source.y} L ${d.target.x},${d.target.y}`; // straight line
export const positionLink = (d) => {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
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

export function randomNode(nodes, isParents = false) {
  const n = isParents ? nodes.filter((n) => n.isParent) : nodes;
  const idx = randomizer(n.length - 1);
  return n[idx];
}

export const buildSimulation = () => {
  return d3
    .forceSimulation()
    .force(
      "link",
      d3
        .forceLink()
        .id(({ id }) => id)
        .distance(LINK_DISTANCE)
        .strength(2)
    )
    .force(
      "charge",
      d3.forceManyBody().strength(ARM_STRENGTH).distanceMax(ARM_MAX_DISTANCE)
    )
    .force("collision", d3.forceCollide(COLLISION_DISTANCE + 1).iterations(10));
};

export const hoverCircleCheck = (isHovered, r) => {
  return isHovered ? r * 2 : r;
};
