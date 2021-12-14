import * as d3 from "d3";
import { useCallback, useEffect, useRef } from "react";

const width = 1000;
const height = 1000;

const CIRCLE_BASE_RADIUS = 20;
const CIRCLE_RADIUS_MULTIPLIER = 2;

function NetworkGraph({ data }) {
  const graphRef = useRef();

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

  function positionLink(d) {
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
  }

  const draw = useCallback(() => {
    const svg = d3.select(graphRef.current);

    const link = svg
      .selectAll(".lines")
      .selectAll("path")
      .data(data.links)
      .join("path")
      .style("stroke", "#aaa")
      .style("stroke-width", "1px")
      .style("fill", "none");

    const node = svg
      .selectAll(".nodes")
      .selectAll("circle")
      .data(data.nodes)
      .join((enter) => {
        const g = enter.append("g");

        g.append("circle")
          .attr("r", (d) => {
            const links = data.links.filter((link) => link.source === d.id);
            return CIRCLE_BASE_RADIUS + links.length * CIRCLE_RADIUS_MULTIPLIER;
          })
          .style("fill", (d) => d.color || "#69b3a2");

        g.append("text")
          .text((d) => d.id)
          .join("text")
          .attr("text-anchor", "middle");

        return g;
      });

    d3.forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink()
          .id(({ id }) => id)
          .links(data.links)
      )
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", () => ticked(link, node));
  }, [data.links, data.nodes]);

  useEffect(() => {
    const main = d3
      .select(graphRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#eee")
      .append("g")
      .attr("class", "main");

    main.append("g").attr("class", "lines");
    main.append("g").attr("class", "nodes");
  }, []);

  useEffect(() => draw(), [draw]);

  return (
    <div>
      <svg ref={graphRef}></svg>
    </div>
  );
}

export default NetworkGraph;
