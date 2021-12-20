import * as d3 from "d3";
import throttle from "lodash.throttle";
import { useCallback, useEffect, useRef } from "react";
import { positionLink, getHeightWidth } from "./helpers";
import { StyledSVGContainer } from "../../styles";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 12;
const CIRCLE_BASE_RADIUS = 5;
const ARM_STRENGTH = -250;
let transform = d3.zoomIdentity;

function NetworkGraph({ data }) {
  const graphRef = useRef();

  const links = data.links;
  const nodes = Object.values(data.nodes);
  // const links = data.links();
  // const nodes = data.descendants();

  const getNodes = useCallback(() => {
    const svg = d3.select(graphRef.current);
    const zoomRect = svg.select(".zoom-rect");
    const link = svg.selectAll(".lines").selectAll("path");
    const node = svg.selectAll(".nodes").selectAll(".circle");
    return { svg, link, node, zoomRect };
  }, []);

  const ticked = (link, node) => {
    link
      .attr("x1", ({ source }) => source.x)
      .attr("y1", ({ source }) => source.y)
      .attr("x2", ({ target }) => target.x)
      .attr("y2", ({ target }) => target.y)
      .attr("d", positionLink);

    node
      .selectAll("circle")
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
  };

  const buildSimulation = useCallback(() => {
    const { link, node } = getNodes();

    return d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink()
          .id(({ id }) => id)
          .links(links)
      )
      .force(
        "charge",
        d3.forceManyBody().strength(ARM_STRENGTH).distanceMax(100)
      )
      .tick(500)
      .on("tick", () => ticked(link, node));
  }, [getNodes, links, nodes]);

  const enableZoom = useCallback(() => {
    const { link, node, zoomRect } = getNodes();

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
    zoomRect.call(zoom).call(zoom.translateTo, 0, 0);
  }, [getNodes]);

  const draw = useCallback(() => {
    const { svg } = getNodes();

    svg
      .selectAll(".lines")
      .selectAll("path")
      .data(links, (d) => `${d.source.parent_id}-${d.target.child_id}`)
      .join("path")
      .attr("stroke", "black")
      .style("stroke-width", "0.5px")
      .style("fill", "none");

    svg
      .selectAll(".nodes")
      .selectAll(".circle")
      .data(nodes, (d) => d.index)
      .join((enter) => {
        const g = enter.append("g").attr("class", "circle");

        g.append("circle").attr("r", (d) =>
          d.children ? CIRCLE_BASE_RADIUS : CIRCLE_BASE_RADIUS * (4 / 6)
        );

        const gText = g
          .append("g")
          .attr("class", (d) =>
            d.children ? "node-text parent-node" : "node-text child-node"
          );

        gText
          .append("text")
          .text((d) => `${d.parent_name}-${d.child_name}`)
          .join("text")
          .style("font-size", (d) => (d.children ? "16px" : "12px"))
          .each(function (d) {
            d.bbox = this.getBBox();
          });

        gText.selectAll("text").remove();

        const xTextMargin = 2;
        const yTextMargin = 0;
        gText
          .append("rect")
          .style("fill", "white")
          .style("opacity", 0.75)
          .attr("width", (d) => d.bbox.width + 2 * xTextMargin)
          .attr("height", (d) => d.bbox.height + 2 * yTextMargin)
          .attr("rx", "5")
          .attr("transform", function (d) {
            return `translate(-${
              (d.bbox.width + xTextMargin) / 2
            }, -${d.bbox.height * 0.8 + CIRCLE_BASE_RADIUS + yTextMargin})`;
          });

        gText
          .append("text")
          .text((d) => `${d.parent_name}-${d.child_name}`)
          .join("text")
          .style("font-size", (d) => (d.children ? "16px" : "12px"))
          .attr("fill", "black")
          .style("text-anchor", "middle")
          .attr("transform", `translate(0, -${CIRCLE_BASE_RADIUS})`);

        return g;
      });

    buildSimulation();
    enableZoom();
  }, [links, nodes, buildSimulation, enableZoom, getNodes]);

  const updateViewportDimensions = useCallback(() => {
    const { svg, zoomRect } = getNodes();
    const { width, height } = getHeightWidth();

    svg.attr("width", width).attr("height", height);
    zoomRect.attr("width", width).attr("height", height);
  }, [getNodes]);

  const throttledResize = throttle(updateViewportDimensions, 100);

  useEffect(() => {
    const { svg } = getNodes();
    svg
      .append("rect")
      .attr("class", "zoom-rect")
      .style("fill", "none")
      .style("pointer-events", "all");

    const main = svg.append("g").attr("class", "main");
    main.append("g").attr("class", "lines");
    main.append("g").attr("class", "nodes");

    updateViewportDimensions();

    window.addEventListener("resize", throttledResize);
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <StyledSVGContainer>
      <svg ref={graphRef}></svg>
    </StyledSVGContainer>
  );
}

export default NetworkGraph;
