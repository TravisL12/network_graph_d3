import * as d3 from "d3";
import { throttle } from "lodash";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { StyledSVGContainer } from "../../styles";
import {
  positionLink,
  getHeightWidth,
  buildSimulation,
  hoverCircleCheck,
} from "./helpers";
import {
  // Constants
  HOVER,
  HOVER_DURATION,
  ZOOM_DURATION,
  CLICK,
  MIN_ZOOM,
  MAX_ZOOM,
  CLICK_ZOOM_LEVEL,
  UPDATE_DURATION,
  WIDE_STROKE_WIDTH,
  REGULAR_STROKE_WIDTH,
  LINK_STROKE_WIDTH,
  ALPHA_MIN,
  ALPHA,
  ALPHA_DECAY,
  PARENT_TEXT_SIZE,
  CHILD_TEXT_SIZE,
  // Helper functions
  getNodeRadius,
  linkStyle,
  textStyle,
  textRectStyle,
  circleStyle,
  darkStrokeColor,
  centerZoom,
  brightStrokeColor,
} from "../../constants";

let zoomTransform = d3.zoomIdentity;

const NetworkGraph = ({ nodes, links, nodeEvent, handleNodeEvent }) => {
  const graphRef = useRef();
  const zoom = d3
    .zoom()
    .scaleExtent([MIN_ZOOM, MAX_ZOOM])
    .on("zoom", (event) => {
      zoomTransform = event.transform;
      const { link, node } = getNodes();
      node.attr("transform", event.transform);
      link.attr("transform", event.transform);
    });

  const getNodes = useCallback(() => {
    const svg = d3.select(graphRef.current);
    const zoomRect = svg.select(".zoom-rect");
    const link = svg.selectAll(".lines").selectAll(".line");
    const node = svg.selectAll(".nodes").selectAll(".node");
    return { svg, link, node, zoomRect };
  }, []);

  const enableZoom = useCallback(() => {
    const { width, height } = getHeightWidth();
    zoomTo(centerZoom(width), height / 2);
  }, []);

  const ticked = useCallback(() => {
    const { link, node } = getNodes();
    const { width, height } = getHeightWidth();

    nodes[0].x = width / 2;
    nodes[0].y = height / 2;

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
  }, [getNodes, nodes]);

  const simulation = useMemo(() => {
    const sim = buildSimulation();
    sim.on("tick", ticked).on("end", () => {
      nodes.forEach((node) => {
        node.fx = node.x;
        node.fy = node.y;
      });
      sim.stop();
    });
    return sim;
  }, [ticked]);

  const updateSimulation = useCallback(() => {
    const { width, height } = getHeightWidth();

    simulation.nodes(nodes);
    simulation.force("link").links(links);
    if (!simulation.force("radial")) {
      simulation.force("radial", d3.forceRadial(1000, width / 2, height / 2));
    }
    simulation
      .alphaDecay(ALPHA_DECAY)
      .alphaMin(ALPHA_MIN)
      .alpha(ALPHA)
      .restart();
  }, [nodes, links, simulation]);

  const handleHoverNode = useCallback(
    (selectedNode) => {
      const { node, link } = getNodes();

      const linkSelection = link.transition().duration(HOVER_DURATION);
      const circleSelection = node
        .select(".circle")
        .transition()
        .duration(HOVER_DURATION);

      const textSelection = node
        .select(".node-text")
        .transition()
        .duration(HOVER_DURATION);

      if (selectedNode?.isParent) {
        const childIds = links
          .filter((link) => link.source.id === selectedNode.id)
          .map(({ target }) => target.id);

        const hasChild = (id) => [selectedNode.id, ...childIds].includes(id);

        textSelection.style("opacity", (d) => (hasChild(d.id) ? 100 : 0));
        linkSelection.attr("stroke", (d) =>
          hasChild(d.source.id) ? darkStrokeColor(d) : darkStrokeColor(d, 1)
        );
        circleSelection.attr("r", (d) =>
          hoverCircleCheck(hasChild(d.id), getNodeRadius(d))
        );
        circleSelection.attr("stroke", (d) =>
          hasChild(d.id) ? darkStrokeColor(d) : darkStrokeColor(d, 1)
        );
        circleSelection.attr("stroke-width", (d) =>
          hasChild(d.id) ? WIDE_STROKE_WIDTH : REGULAR_STROKE_WIDTH
        );
      } else if (selectedNode) {
        const hasChild = (id) => id === selectedNode?.id;

        textSelection.style("opacity", (d) => (hasChild(d.id) ? 100 : 0));
        linkSelection.attr("stroke", (d) => darkStrokeColor(d, 1));
        circleSelection.attr("r", (d) =>
          hoverCircleCheck(hasChild(d.id), getNodeRadius(d))
        );
        circleSelection.attr("stroke", (d) =>
          hasChild(d.id) ? darkStrokeColor(d) : darkStrokeColor(d, 1)
        );
        circleSelection.attr("stroke-width", (d) =>
          hasChild(d.id) ? WIDE_STROKE_WIDTH : REGULAR_STROKE_WIDTH
        );
      } else {
        // resets all nodes if not a parent (or if no node selected)
        circleSelection.call(circleStyle);
        textSelection.style("opacity", 0);
        linkSelection.attr("stroke", (d) => darkStrokeColor(d, 1));
      }
    },
    [getNodes, links]
  );

  const zoomTo = (x, y, scale = 1) => {
    const { zoomRect } = getNodes();
    zoomRect
      .call(zoom)
      .transition()
      .duration(ZOOM_DURATION)
      .call(zoom.translateTo, x, y)
      .transition()
      .duration(500)
      .call(zoom.scaleTo, scale);
  };

  const handleNodeClickZoom = (event) => {
    const { x, y } = d3.select(event.target.parentNode).data()[0];
    zoomTo(x, y, CLICK_ZOOM_LEVEL);
  };

  const handleMouseOver = useCallback(
    (event) => {
      const d = d3.select(event.target.parentNode).data();
      handleNodeEvent(d[0].id, HOVER);
    },
    [handleHoverNode]
  );

  const handleMouseOut = useCallback(() => {
    handleHoverNode(null);
  }, [handleHoverNode]);

  const draw = useCallback(() => {
    const { node, link } = getNodes();

    link
      .data(
        links,
        (d) => `${d.source.id || d.source}-${d.target.id || d.target}`
      )
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("class", "line")
            .attr("stroke", brightStrokeColor())
            .style("stroke-width", (d) => `${d.weight * LINK_STROKE_WIDTH}px`)
            .call(linkStyle),
        (update) => {
          update.style("stroke-width", (d) => {
            if (d.target.isParent) {
              const linkCount = links.filter(
                (link) => link.source.id === d.target.id
              );
              const thickness = linkCount.length + 1; // add +1 for new link not counted yet
              return `${thickness * LINK_STROKE_WIDTH}px`;
            }
            return `${LINK_STROKE_WIDTH}px`;
          });
        }
      );

    node
      .data(nodes, (d) => {
        return d.id;
      })
      .join(
        (enter) => {
          const g = enter.append("g").attr("class", "node");

          g.append("circle")
            .attr("class", "circle")
            .call(circleStyle)
            .on("dblclick", handleNodeClickZoom)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);

          const gText = g
            .append("g")
            .style("opacity", 0)
            .attr("class", (d) =>
              d.isParent ? "node-text parent-node" : "node-text child-node"
            )
            .on("dblclick", handleNodeClickZoom)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);

          // Measure text and Remove
          gText
            .append("text")
            .text((d) => d.name)
            .join("text")
            .style("font-size", (d) =>
              d.isParent ? PARENT_TEXT_SIZE : CHILD_TEXT_SIZE
            )
            .each(function (d) {
              d.bbox = this.getBBox();
            });
          gText.selectAll("text").remove();

          // Render text with background
          gText.append("rect").call(textRectStyle);
          gText
            .append("text")
            .text((d) => d.name)
            .join("text")
            .call(textStyle);

          return g;
        },
        (update) => {
          const callUpdate = (u) => {
            u.transition().duration(UPDATE_DURATION);
          };

          update
            .select(".node .node-text")
            .attr("class", (d) =>
              d.isParent ? "node-text parent-node" : "node-text child-node"
            );

          update
            .select(".node circle")
            .style("fill", (d) => d.color)
            .call(callUpdate);
          update.select(".node .node-text rect").call(callUpdate);
          update.select(".node .node-text text").call(callUpdate);
        }
      );

    updateSimulation();
  }, [
    links,
    nodes,
    getNodes,
    handleMouseOut,
    handleMouseOver,
    updateSimulation,
  ]);

  const updateViewportDimensions = useCallback(() => {
    const { svg, zoomRect } = getNodes();
    const { width, height } = getHeightWidth();
    svg.attr("width", width).attr("height", height);
    zoomRect.attr("width", width).attr("height", height);
  }, [getNodes]);

  const throttledResize = throttle(updateViewportDimensions, 100);

  useEffect(() => {
    const { zoomRect } = getNodes();
    const { width, height } = getHeightWidth();
    zoomRect.on("dblclick", () => {
      zoomTo(centerZoom(width), height / 2);
    });

    updateViewportDimensions();
    window.addEventListener("resize", throttledResize);
  }, []);

  useEffect(() => {
    draw();
    enableZoom();
  }, [draw, enableZoom]);

  useEffect(() => {
    if (nodeEvent?.type === HOVER) {
      handleHoverNode(nodeEvent.node);
    }
    if (nodeEvent?.type === CLICK) {
      const { x, y } = nodeEvent.node;
      zoomTo(x, y, CLICK_ZOOM_LEVEL);
    }
  }, [nodeEvent]);

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
};

export default NetworkGraph;
