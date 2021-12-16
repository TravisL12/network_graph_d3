import * as d3 from "d3";
import throttle from "lodash.throttle";
import { useCallback, useEffect, useRef } from "react";
import { getHeightWidth } from "../NetworkGraph/helpers";
import { StyledSVGContainer } from "../../styles";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 12;
const CIRCLE_BASE_RADIUS = 10;
let transform = d3.zoomIdentity;

function TreeGraph({ data }) {
  const graphRef = useRef();

  const { width, height } = getHeightWidth();
  const treeMap = d3.tree().size([width, height || 500]);
  const root = d3.hierarchy(data);
  const treeData = treeMap(root);
  const nodes = treeData.descendants();
  const links = treeData.links();

  const getNodes = useCallback(() => {
    const svg = d3.select(graphRef.current);
    const zoomRect = svg.select(".zoom-rect");
    const link = svg.selectAll(".lines").selectAll("path");
    const node = svg.selectAll(".nodes").selectAll(".circle");
    return { svg, link, node, zoomRect };
  }, []);

  const enableZoom = useCallback(() => {
    const { link, node, zoomRect } = getNodes();

    const zoomed = (event) => {
      transform = event.transform;
      node.attr("transform", event.transform);
      link.attr("transform", event.transform);

      // hide text when zoomed way out
      if (transform.k < 0.6) {
        node.selectAll("text").style("display", "none");
      } else {
        // maintain text size as you zoom in
        const fontSize = transform.k < 1.1 ? 14 : 16;
        const fontScaled = fontSize / transform.k;
        node
          .selectAll("text")
          .style("font-size", `${fontScaled}px`)
          .style("display", "block");
      }
    };

    const zoom = d3.zoom().scaleExtent([MIN_ZOOM, MAX_ZOOM]).on("zoom", zoomed);
    zoomRect.call(zoom).call(zoom.translateTo, 750, 300);
  }, [getNodes]);

  const draw = useCallback(() => {
    const { svg } = getNodes();

    svg
      .selectAll(".lines")
      .selectAll("path")
      .data(links, (d) => `${d.source.data.id}-${d.target.data.id}`)
      .join("path")
      .attr("stroke", "#177E89")
      .style("stroke-width", "1px")
      .style("fill", "none")
      .attr("d", (d) => {
        const { x, y, parent } = d.target;
        return `M${x},${y}C${x},${(y + parent.y) / 2} ${parent.x},${
          (y + parent.y) / 2
        } ${parent.x},${parent.y}`;
      });

    svg
      .selectAll(".nodes")
      .selectAll(".circle")
      .data(nodes, (d) => d.index)
      .join((enter) => {
        const g = enter.append("g").attr("class", "circle");

        g.append("circle")
          .attr("r", CIRCLE_BASE_RADIUS)
          .style("fill", "red")
          .attr("transform", (d) => {
            return `translate(${d.x},${d.y})`;
          });

        g.append("text")
          .text((d) => d.data.id)
          .join("text")
          .style("font-size", `12px`)
          .attr("fill", "black")
          .attr("transform", (d) => {
            return `translate(${d.x},${d.y})`;
          });

        return g;
      });

    enableZoom();
  }, [nodes, enableZoom, getNodes]);

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

export default TreeGraph;
