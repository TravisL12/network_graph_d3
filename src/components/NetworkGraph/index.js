import * as d3 from "d3";
import throttle from "lodash.throttle";
import { useCallback, useEffect, useRef } from "react";
import { positionLink, getHeightWidth, getColors } from "./helpers";
import { StyledSVGContainer } from "../../styles";

const CIRCLE_BASE_RADIUS = 15;
const ARM_STRENGTH = -250;

function NetworkGraph({ data }) {
  const graphRef = useRef();
  const color = getColors(data);

  const buildSimulation = (link, node) => {
    const { width, height } = getHeightWidth();
    d3.forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink()
          .id(({ id }) => id)
          .links(data.links)
      )
      .force("charge", d3.forceManyBody().strength(ARM_STRENGTH))
      .force("center", d3.forceCenter(width * (3 / 5), height / 2))
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

    const link = svg
      .selectAll(".lines")
      .selectAll("path")
      .data(data.links)
      .join("path")
      .attr("stroke", "white")
      .style("stroke-width", "1px")
      .style("fill", "none");

    const node = svg
      .selectAll(".nodes")
      .selectAll("circle")
      .data(data.nodes)
      .join((enter) => {
        const g = enter.append("g");

        g.append("circle")
          .attr("r", CIRCLE_BASE_RADIUS)
          .style("fill", (d) => color(d.id));

        g.append("text")
          .text((d) => d.id)
          .join("text")
          .style("font-size", "12px")
          .attr("fill", "white")
          .attr("text-anchor", "middle")
          .attr("transform", `translate(0, -${CIRCLE_BASE_RADIUS + 10})`);

        return g;
      });

    buildSimulation(link, node);
  }, [data.links, data.nodes]);

  const updateWindow = useCallback(() => {
    const svg = d3.select(graphRef.current);
    const { width, height } = getHeightWidth();

    svg.attr("width", width).attr("height", height);
  }, []);

  const throttledResize = throttle(updateWindow, 100);

  useEffect(() => {
    const svg = d3.select(graphRef.current);
    const main = svg.append("g").attr("class", "main");

    main.append("g").attr("class", "lines");
    main.append("g").attr("class", "nodes");

    updateWindow();

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
