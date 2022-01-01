import * as d3 from "d3";
import { throttle } from "lodash";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { positionLink, getHeightWidth } from "./helpers";
import { StyledSVGContainer } from "../../styles";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 12;

const CIRCLE_BASE_RADIUS = 8;
const CHILD_CIRCLE_BASE_RADIUS = CIRCLE_BASE_RADIUS * (4 / 6);
const UPDATE_DURATION = 500;

const COLLISION_DISTANCE = CIRCLE_BASE_RADIUS / 6;
const LINK_STROKE_WIDTH = 0.25;
const STROKE_COLOR = "#177E89";

const ARM_STRENGTH = -250;
const ARM_MAX_DISTANCE = 1000;

const ALPHA_MIN = 0.05; // stop speed
const ALPHA = 0.5; // start speed
// const ALPHA_DECAY = 0.2; // speed to decay to stop

let transform = d3.zoomIdentity;

function NetworkGraph({ nodes, links }) {
  const graphRef = useRef();

  const getNodes = useCallback(() => {
    const svg = d3.select(graphRef.current);
    const zoomRect = svg.select(".zoom-rect");
    const link = svg.selectAll(".lines").selectAll(".line");
    const node = svg.selectAll(".nodes").selectAll(".node");
    return { svg, link, node, zoomRect };
  }, []);

  const ticked = useCallback(() => {
    const { link, node } = getNodes();
    link
      .attr("x1", ({ source }) => source.x)
      .attr("y1", ({ source }) => source.y)
      .attr("x2", ({ target }) => target.x)
      .attr("y2", ({ target }) => target.y)
      .attr("d", positionLink);

    node
      .selectAll(".node circle")
      .attr("cx", ({ x }) => x)
      .attr("cy", ({ y }) => y);

    node
      .selectAll("text")
      .attr("x", ({ x }) => x)
      .attr("y", ({ y }) => y);

    node
      .selectAll("rect")
      .attr("x", ({ x }) => x)
      .attr("y", ({ y }) => y);
  }, [getNodes]);

  const simulation = useMemo(() => {
    return d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .id(({ id }) => id)
          .distance(50)
          .strength(2)
      )
      .force(
        "charge",
        d3.forceManyBody().strength(ARM_STRENGTH).distanceMax(ARM_MAX_DISTANCE)
      )
      .force("collision", d3.forceCollide(COLLISION_DISTANCE))
      .on("tick", ticked);
  }, [ticked]);

  const updateSimulation = () => {
    const { width, height } = getHeightWidth();

    simulation.nodes(nodes);
    simulation.force("center", d3.forceCenter(width / 2, height / 2));
    simulation.force("link").links(links);
    simulation.alphaMin(ALPHA_MIN).alpha(ALPHA).restart();
  };

  const enableZoom = useCallback(() => {
    const { link, node, zoomRect } = getNodes();
    const { width, height } = getHeightWidth();

    const zoomed = (event) => {
      transform = event.transform;
      node.attr("transform", event.transform);
      link.attr("transform", event.transform);

      // hide text when zoomed way out
      if (transform.k < 0.9) {
        node.selectAll(".child-node").style("display", "none");
      } else {
        node.selectAll(".node-text").style("display", "block");
      }
    };

    const zoom = d3.zoom().scaleExtent([MIN_ZOOM, MAX_ZOOM]).on("zoom", zoomed);
    zoomRect.call(zoom).call(zoom.translateTo, width / 2, height / 2);
  }, [getNodes]);

  const draw = useCallback(() => {
    const { node, link } = getNodes();

    link
      .data(links, (d) => {
        return `${d.source.id}-${d.target.id}`;
      })
      .join((enter) => {
        const path = enter
          .append("path")
          .attr("class", "line")
          .attr("stroke", d3.color(STROKE_COLOR).brighter(1.5))
          .style("stroke-width", `${LINK_STROKE_WIDTH * 10}px`)
          .style("fill", "none")
          .call((e) => {
            e.transition()
              .duration(UPDATE_DURATION * 3)
              .attr("stroke", STROKE_COLOR)
              .style("stroke-width", `${LINK_STROKE_WIDTH}px`);
          });
        return path;
      });

    node
      .data(nodes, (d) => d.id)
      .join(
        (enter) => {
          const g = enter.append("g").attr("class", "node");

          g.append("circle")
            .attr("r", (d) =>
              d.children ? CIRCLE_BASE_RADIUS : CHILD_CIRCLE_BASE_RADIUS
            )
            .style(
              "fill",
              (d) => d.color || d3.color(d.parent.color).brighter(1.6)
            );

          const gText = g
            .append("g")
            .attr("class", (d) =>
              d.children ? "node-text parent-node" : "node-text child-node"
            );

          gText
            .append("text")
            .text((d) => d.name)
            .join("text")
            .style("font-size", (d) => (d.children ? "16px" : "12px"))
            .each(function (d) {
              d.bbox = this.getBBox();
            });

          gText.selectAll("text").remove();

          const xMargin = 4;
          const yMargin = 0;
          gText
            .append("rect")
            .style("fill", "white")
            .style("opacity", 0.8)
            .attr("width", (d) => d.bbox.width + 2 * xMargin)
            .attr("height", (d) => d.bbox.height + 2 * yMargin)
            .attr("rx", "5")
            .attr("transform", function (d) {
              return `translate(-${
                (d.bbox.width + xMargin) / 2
              }, -${d.bbox.height * 0.8 + CIRCLE_BASE_RADIUS + yMargin})`;
            });

          gText
            .append("text")
            .text((d) => d.name)
            .join("text")
            .style("font-size", (d) => (d.children ? "16px" : "12px"))
            .attr("fill", "black")
            .style("text-anchor", "middle")
            .attr("transform", `translate(0, -${CIRCLE_BASE_RADIUS})`);

          return g;
        },
        (update) => {
          const callUpdate = (u) => {
            u.transition().duration(UPDATE_DURATION);
          };

          update.select(".node circle").call(callUpdate);
          update.select(".node .node-text rect").call(callUpdate);
          update.select(".node .node-text text").call(callUpdate);
        }
      );

    updateSimulation();
  }, [links, nodes, getNodes, simulation]);

  const updateViewportDimensions = useCallback(() => {
    const { svg, zoomRect } = getNodes();
    const { width, height } = getHeightWidth();
    svg.attr("width", width).attr("height", height);
    zoomRect.attr("width", width).attr("height", height);
  }, [getNodes]);

  const throttledResize = throttle(updateViewportDimensions, 100);

  useEffect(() => {
    updateViewportDimensions();
    window.addEventListener("resize", throttledResize);
  }, []);

  useEffect(() => {
    draw();
    enableZoom();
  }, [draw, enableZoom]);

  return (
    <StyledSVGContainer>
      <svg ref={graphRef}>
        <rect
          className="zoom-rect"
          style={{ fill: "none", pointerEvents: "all" }}
        />
        <g className="main">
          <g className="lines"></g>
          <g className="nodes"></g>
        </g>
      </svg>
    </StyledSVGContainer>
  );
}

export default NetworkGraph;
