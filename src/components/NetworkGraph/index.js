import * as d3 from "d3";
import { useEffect, useRef } from "react";
import styled from "styled-components";

const SNetworkContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const mainWidth = 750;
export const mainHeight = 400;
export const margin = { top: 20, right: 30, bottom: 30, left: 30 };

const width = mainWidth - margin.left - margin.right;
const height = mainHeight - margin.top - margin.bottom;
const data = fetch(`${process.env.PUBLIC_URL}/data_network.json`)
  .then((d) => d.json())
  .then((values) => {
    console.log(values);
  });

function NetworkGraph() {
  const graphRef = useRef();
  // initialize graph
  useEffect(() => {
    // create viewport
    const main = d3
      .select(graphRef.current)
      .attr("width", mainWidth)
      .attr("height", mainHeight)
      .append("g")
      .attr("class", "main")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    main.append("g").attr("class", "lines");

    main
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`);

    // create y-axis
    main.append("g").attr("class", "y-axis");
  }, []);

  // useEffect(() => {
  //   draw();
  // }, [data, draw]);

  return (
    <SNetworkContainer>
      This is a graph
      <div>
        <svg ref={graphRef}></svg>
      </div>
    </SNetworkContainer>
  );
}

export default NetworkGraph;
