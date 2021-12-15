import * as d3 from "d3";
import throttle from "lodash.throttle";
import { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";

const StyledSVGContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  vertical-align: top;
  overflow: hidden;
`;

const CIRCLE_BASE_RADIUS = 20;

// https://bl.ocks.org/emeeks/c2822e1067ff91abe24e
function positionLink(d) {
  const dx = d.target.x - d.source.x;
  const dy = d.target.y - d.source.y;
  const curveRate = 1; // smaller curve rate makes curvier lines
  const dr = Math.sqrt(dx * dx + dy * dy) * curveRate;
  return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
}

const getHeightWidth = () => {
  const g = document.body;
  const width = g.clientWidth;
  const height = g.clientHeight;
  return { width, height };
};

function NetworkGraph({ data }) {
  const graphRef = useRef();

  const color = d3
    .scaleOrdinal(d3.schemeCategory10)
    .domain(data.nodes.map(({ id }) => id));

  const ticked = (link, node) => {
    link
      .attr("x1", ({ source }) => source.x)
      .attr("y1", ({ source }) => source.y)
      .attr("x2", ({ target }) => target.x)
      .attr("y2", ({ target }) => target.y)
      .attr("d", positionLink);

    node
      .selectAll("circle")
      .attr("cx", ({ x }) => x + 6)
      .attr("cy", ({ y }) => y - 6);

    node
      .selectAll("text")
      .attr("x", ({ x }) => x + 6)
      .attr("y", ({ y }) => y);
  };

  const draw = useCallback(() => {
    const svg = d3.select(graphRef.current);

    const link = svg
      .selectAll(".lines")
      .selectAll("path")
      .data(data.links)
      .join("path")
      .attr("stroke", (d) => color(d.id))
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
          .attr("text-anchor", "middle");

        return g;
      });

    const { width, height } = getHeightWidth();
    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink()
          .id(({ id }) => id)
          .links(data.links)
      )
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("center", d3.forceCenter(width * (3 / 5), height / 2))
      .on("tick", () => ticked(link, node));
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
