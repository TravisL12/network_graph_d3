import * as d3 from "d3";

export const HOVER = "hover";
export const CLICK = "click";

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 12;
export const INITIAL_ZOOM = 0.4;
export const CLICK_ZOOM_LEVEL = 1.5;
export const UPDATE_DURATION = 500;
export const HOVER_DURATION = 100;
export const ZOOM_DURATION = 250;
export const TEXT_BG_OPACITY = 0.8;

export const CIRCLE_BASE_RADIUS = 8;
export const ROOT_BASE_RADIUS = CIRCLE_BASE_RADIUS * 4;
export const CHILD_CIRCLE_BASE_RADIUS = CIRCLE_BASE_RADIUS * (7 / 8);

export const HOVER_RADIUS = 1.4;
export const STROKE_COLOR = "#177E89";

const stroke = 2;
export const REGULAR_STROKE_WIDTH = `${stroke}px`;
export const WIDE_STROKE_WIDTH = `${stroke * 1.4}px`;

export const PARENT_TEXT_SIZE = "16px";
export const CHILD_TEXT_SIZE = "12px";

export const MAX_LINK_STROKE = 10;
export const LINK_STROKE_WIDTH = 0.5;
export const LINK_DISTANCE = 100;

export const ARM_STRENGTH = -100;
export const ARM_MAX_DISTANCE = 10;

export const ALPHA_MIN = 0.05; // stop speed
export const ALPHA = 0.25; // start speed
export const ALPHA_DECAY = 0.05; // speed to decay to stop

export const X_MARGIN = 4; // margins for text/label background
export const Y_MARGIN = 0; // margins for text/label background

export const getNodeRadius = (d) => {
  return d.isRoot
    ? ROOT_BASE_RADIUS
    : d.isParent
    ? CIRCLE_BASE_RADIUS
    : CHILD_CIRCLE_BASE_RADIUS;
};

export const darkStrokeColor = (d, amount = 1.5) =>
  d3.color(d.color).darker(amount);
export const brightStrokeColor = (color = STROKE_COLOR) =>
  d3.color(color).brighter(1.5);
export const centerZoom = (width) => (3 * width) / 5;

export const circleStyle = (circle) => {
  circle
    .attr("r", (d) => getNodeRadius(d))
    .style("fill", (d) => d.color || brightStrokeColor(d.parent.color))
    .attr("stroke", (d) => darkStrokeColor(d))
    .attr("stroke-width", REGULAR_STROKE_WIDTH);
};

export const linkStyle = (link) => {
  link.style("fill", "none").call((e) => {
    e.transition()
      .duration(UPDATE_DURATION * 3)
      .attr("stroke", (d) => darkStrokeColor(d, 1));
  });
};

export const textStyle = (text) => {
  text
    .style("font-size", (d) =>
      d.isParent ? PARENT_TEXT_SIZE : CHILD_TEXT_SIZE
    )
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .attr("transform", `translate(0, -${CIRCLE_BASE_RADIUS})`);
};

export const textRectStyle = (rect) => {
  rect
    .style("fill", "white")
    .style("opacity", TEXT_BG_OPACITY)
    .attr("width", (d) => d.bbox.width + 2 * X_MARGIN)
    .attr("height", (d) => d.bbox.height + 2 * Y_MARGIN)
    .attr("rx", "5")
    .attr("transform", function (d) {
      return `translate(-${
        (d.bbox.width + X_MARGIN) / 2
      }, -${d.bbox.height * 0.8 + CIRCLE_BASE_RADIUS + Y_MARGIN})`;
    });
};

/**
 * zoom to fit
 * scale the text based on zoom (smaller text when high zoom scale)
 * less arm length between parent and child
 * large arm length between root and child
 * last node being hollow
 * work with predefined data, not manually creating it
 *
 * x - click to show/keep names
 * x - double click zoom to fit node with children
 * x - weighting based on number of children
 * x - colors get darker as they grow children (not random color)
 * x - zoom and translate together
 */
