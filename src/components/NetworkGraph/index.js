import * as d3 from "d3";
import throttle from "lodash.throttle";
import { useCallback, useEffect, useRef } from "react";
import { positionLink, getHeightWidth } from "./helpers";
import { StyledSVGContainer } from "../../styles";

const CIRCLE_BASE_RADIUS = 15;
const ARM_STRENGTH = -250;
let transform = d3.zoomIdentity;

function NetworkGraph({ data }) {
  const graphRef = useRef();

  const root = d3.hierarchy(data);
  const links = root.links();
  const nodes = root.descendants();

  const buildSimulation = (link, node) => {
    d3.forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink()
          .id(({ id }) => id)
          .links(links)
      )
      .force("charge", d3.forceManyBody().strength(ARM_STRENGTH))
      .on("tick", () => ticked(link, node));
  };

  const ticked = (link, node) => {
    link
      .attr("x1", ({ source }) => source.x)
      .attr("y1", ({ source }) => source.y)
      .attr("x2", ({ target }) => target.x)
      .attr("y2", ({ target }) => target.y)
      .attr("d", positionLink);

    const nodePosition = CIRCLE_BASE_RADIUS / 4;
    node
      .selectAll("circle")
      .attr("cx", ({ x }) => x + nodePosition)
      .attr("cy", ({ y }) => y - nodePosition);

    node
      .selectAll("text")
      .attr("x", ({ x }) => x + nodePosition)
      .attr("y", ({ y }) => y);
  };

  const draw = useCallback(() => {
    const svg = d3.select(graphRef.current);
    const zoomRect = svg.select(".zoom-rect");

    const link = svg
      .selectAll(".lines")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("stroke", "white")
      .style("stroke-width", "1px")
      .style("fill", "none");

    const node = svg
      .selectAll(".nodes")
      .selectAll("circle")
      .data(nodes)
      .join((enter) => {
        const g = enter.append("g");

        g.append("circle")
          .attr("r", CIRCLE_BASE_RADIUS)
          .style("fill", (d) => {
            return d.data.color || d.parent.data.color;
          });

        g.append("text")
          .text((d) => d.data.id)
          .join("text")
          .style("font-size", `12px`)
          .attr("fill", "white")
          .attr("text-anchor", "middle")
          .attr("transform", `translate(0, -${CIRCLE_BASE_RADIUS + 10})`);

        return g;
      });

    buildSimulation(link, node);

    const zoomed = (event) => {
      transform = event.transform;
      node.attr("transform", event.transform);
      link.attr("transform", event.transform);

      // maintain text size as you zoom in
      const fontScaled = 12 / transform.k;
      node.selectAll("text").style("font-size", `${fontScaled}px`);
    };

    const zoom = d3.zoom().scaleExtent([0.5, 12]).on("zoom", zoomed);
    zoomRect.call(zoom).call(zoom.translateTo, 0, 0);
  }, [links, nodes]);

  const updateViewportDimensions = useCallback(() => {
    const svg = d3.select(graphRef.current);
    const { width, height } = getHeightWidth();

    svg.attr("width", width).attr("height", height);
    svg.select(".zoom-rect").attr("width", width).attr("height", height);
  }, []);

  const throttledResize = throttle(updateViewportDimensions, 100);

  useEffect(() => {
    const svg = d3.select(graphRef.current);
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

  useEffect(() => draw(), [draw]);

  return (
    <StyledSVGContainer>
      <svg ref={graphRef}></svg>
    </StyledSVGContainer>
  );
}

export default NetworkGraph;
