import * as d3 from "d3";
import throttle from "lodash.throttle";
import { useCallback, useEffect, useRef } from "react";
import { positionLink, getHeightWidth } from "./helpers";
import { StyledSVGContainer } from "../../styles";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 12;
const CIRCLE_BASE_RADIUS = 8;
const ARM_STRENGTH = -500;
const ARM_MAX_DISTANCE = 250;
let transform = d3.zoomIdentity;

function NetworkGraph({ data }) {
  const graphRef = useRef();

  const root = d3.hierarchy(data);
  const links = root.links();
  const nodes = root.descendants();

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
    const { width, height } = getHeightWidth();

    return d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id(({ id }) => id)
          .distance(50)
          .strength(2)
      )
      .force(
        "charge",
        d3.forceManyBody().strength(ARM_STRENGTH).distanceMax(ARM_MAX_DISTANCE)
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .tick(500)
      .on("tick", () => ticked(link, node));
  }, [getNodes, links, nodes]);

  const enableZoom = useCallback(() => {
    const { link, node, zoomRect } = getNodes();
    const { width, height } = getHeightWidth();

    const zoomed = (event) => {
      transform = event.transform;
      node.attr("transform", event.transform);
      link.attr("transform", event.transform);

      // // hide text when zoomed way out
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
    const { svg } = getNodes();

    svg
      .selectAll(".lines")
      .selectAll("path")
      .data(links, (d) => `${d.source.data.id}-${d.target.data.id}`)
      .join("path")
      .attr("stroke", "#177E89")
      .style("stroke-width", "0.2px")
      .style("fill", "none");

    svg
      .selectAll(".nodes")
      .selectAll(".circle")
      .data(nodes, (d) => d.index)
      .join((enter) => {
        const g = enter.append("g").attr("class", "circle");

        g.append("circle")
          .attr("r", (d) =>
            d.children ? CIRCLE_BASE_RADIUS : CIRCLE_BASE_RADIUS * (4 / 6)
          )
          .style(
            "fill",
            (d) => d.data.color || d3.color(d.parent.data.color).brighter(1.6)
          );

        const gText = g
          .append("g")
          .attr("class", (d) =>
            d.children ? "node-text parent-node" : "node-text child-node"
          );

        gText
          .append("text")
          .text((d) => d.data.id)
          .join("text")
          .style("font-size", (d) => (d.children ? "16px" : "12px"))
          .each(function (d) {
            d.bbox = this.getBBox();
          });

        gText.selectAll("text").remove();

        const xMargin = 2;
        const yMargin = 0;
        gText
          .append("rect")
          .style("fill", "white")
          .style("opacity", 0.75)
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
          .text((d) => d.data.id)
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
