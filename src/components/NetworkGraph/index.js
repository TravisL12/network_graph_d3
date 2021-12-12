import * as d3 from "d3";
import { useCallback, useEffect, useRef } from "react";

export const mainWidth = 600;
export const mainHeight = 600;
export const margin = { top: 0, right: 0, bottom: 0, left: 0 };

const width = mainWidth - margin.left - margin.right;
const height = mainHeight - margin.top - margin.bottom;

const CIRCLE_BASE_RADIUS = 20;
const CIRCLE_RADIUS_MULTIPLIER = 3;

function NetworkGraph({ data }) {
  const graphRef = useRef();

  useEffect(() => {
    const main = d3
      .select(graphRef.current)
      .attr("width", mainWidth)
      .attr("height", mainHeight)
      .style("background", "#eee")
      .append("g")
      .attr("class", "main")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    main.append("g").attr("class", "lines");
    main.append("g").attr("class", "nodes");
  }, []);

  const draw = useCallback(() => {
    const svg = d3.select(graphRef.current);
    d3.forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink()
          .id(function (d) {
            return d.id;
          })
          .links(data.links)
      )
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("end", ticked);

    const link = svg
      .selectAll(".lines")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .style("stroke", "#aaa");

    // Initialize the nodes
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
          .style("fill", (d) => d.color || "#69b3a2")
          .call((e) => e.transition());

        g.append("text")
          .text((d) => d.name)
          .join("text")
          .attr("text-anchor", "middle");

        return g;
      });

    function ticked() {
      link
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });

      node
        .selectAll("circle")
        .attr("cx", function (d) {
          return d.x + 6;
        })
        .attr("cy", function (d) {
          return d.y - 6;
        });

      node
        .selectAll("text")
        .attr("x", function (d) {
          return d.x + 6;
        })
        .attr("y", function (d) {
          return d.y;
        });
    }
  }, [data.links, data.nodes]);

  useEffect(() => draw(), [draw]);

  return (
    <div>
      This is a graph
      <div>
        <svg ref={graphRef}></svg>
      </div>
    </div>
  );
}

export default NetworkGraph;
