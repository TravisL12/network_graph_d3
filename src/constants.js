import * as d3 from "d3";

export const HOVER = "hover";
export const CLICK = "click";

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 12;
export const CLICK_ZOOM_LEVEL = 3;
export const UPDATE_DURATION = 500;

export const CIRCLE_BASE_RADIUS = 8;
export const ROOT_BASE_RADIUS = CIRCLE_BASE_RADIUS * 2;
export const CHILD_CIRCLE_BASE_RADIUS = CIRCLE_BASE_RADIUS * (7 / 8);

export const COLLISION_DISTANCE = CIRCLE_BASE_RADIUS * 3;
export const STROKE_COLOR = "#177E89";
export const WIDE_STROKE_WIDTH = "4px";
export const REGULAR_STROKE_WIDTH = "2px";
export const strokeColor = (d) => d3.color(d.color).darker(1);
export const darkStrokeColor = (d) => d3.color(d.color).darker(1.5);

export const LINK_STROKE_WIDTH = 0.25;
export const LINK_DISTANCE = 200;

export const ARM_STRENGTH = 50;
export const ARM_MAX_DISTANCE = 200;

export const ALPHA_MIN = 0.1; // stop speed
export const ALPHA = 0.5; // start speed
export const ALPHA_DECAY = 0.05; // speed to decay to stop

export const xMargin = 4;
export const yMargin = 0;
