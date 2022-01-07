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
  INITIAL_ZOOM,
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
  MAX_LINK_STROKE,
} from "../../constants";

let zoomTransform = d3.zoomIdentity;

const NetworkGraph = ({ nodes, links, nodeEvent, handleNodeEvent, size }) => {
  const graphRef = useRef();
  const { width, height } = size;
  const zoom = d3
    .zoom()
    .scaleExtent([MIN_ZOOM, MAX_ZOOM])
    .on("zoom", (event) => {
      const { link, node } = getNodes();
      zoomTransform = event.transform;
      node.attr("transform", zoomTransform);
      link.attr("transform", zoomTransform);
    });

  const getNodes = useCallback(() => {
    const svg = d3.select(graphRef.current);
    const link = svg.selectAll(".lines").selectAll(".line");
    const node = svg.selectAll(".nodes").selectAll(".node");
    return { svg, link, node };
  }, []);

  const ticked = useCallback(() => {
    const { link, node } = getNodes();

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
    const sim = buildSimulation({ width, height });
    sim.on("tick", ticked).on("end", () => {
      nodes.forEach((node) => {
        node.fx = node.x;
        node.fy = node.y;
      });
      sim.stop();
    });
    return sim;
  }, [ticked, width, height]);

  const updateSimulation = useCallback(() => {
    const { node, link } = getNodes();

    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation
      // .alphaDecay(ALPHA_DECAY)
      // .alphaMin(ALPHA_MIN)
      // .alpha(ALPHA)
      .restart();

    // update nodes and links with current zoom position
    node.attr("transform", zoomTransform);
    link.attr("transform", zoomTransform);
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
        textSelection.style("display", (d) =>
          hasChild(d.id) ? "inline-block" : "none"
        );
        linkSelection.attr("stroke", (d) =>
          hasChild(d.source.id) ? darkStrokeColor(d) : darkStrokeColor(d, 1)
        );
        linkSelection.attr("stroke-width", (d) => {
          const val = hasChild(d.source.id)
            ? `${20 * LINK_STROKE_WIDTH}px`
            : `${LINK_STROKE_WIDTH}px`;
          console.log(val);
          return val;
        });
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
        link.attr("stroke", (d) => darkStrokeColor(d, 1));
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
      }
    },
    [getNodes, links]
  );

  const zoomTo = (x, y, scale = INITIAL_ZOOM) => {
    const { svg } = getNodes();

    svg
      .call(zoom)
      .transition()
      .duration(ZOOM_DURATION)
      .call(zoom.transform, () =>
        d3.zoomIdentity
          .translate(centerZoom(width), height / 2)
          .scale(scale)
          .translate(-x, -y)
      );
  };

  const handleNodeDoubleClickZoom = (event) => {
    const { x, y } = d3.select(event.target.parentNode).data()[0];
    zoomTo(x, y, CLICK_ZOOM_LEVEL);
  };

  const handleClickShowNames = (event, show = false) => {
    const { node } = getNodes();
    const textSelection = node
      .select(".node-text")
      .transition()
      .duration(HOVER_DURATION);

    if (!show) {
      textSelection.style("opacity", 0).style("display", "none");
      return;
    }

    const selected = d3.select(event.target.parentNode).data()[0];
    const childIds = links
      .filter((link) => link.source.id === selected.id)
      .map(({ target }) => target.id);
    const hasChild = (id) => [selected.id, ...childIds].includes(id);

    textSelection
      .style("opacity", (d) => (hasChild(d.id) ? 100 : 0))
      .style("display", (d) => (hasChild(d.id) ? "inline-block" : "none"));
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
      .join((enter) =>
        enter
          .append("path")
          .attr("class", "line")
          .attr("stroke", brightStrokeColor())
          .style(
            "stroke-width",
            (d) =>
              `${
                (d.source.childCount > MAX_LINK_STROKE
                  ? MAX_LINK_STROKE
                  : d.source.childCount) * LINK_STROKE_WIDTH
              }px`
          )
          .call(linkStyle)
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
            .on("click", (event) => handleClickShowNames(event, true))
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);

          const gText = g
            .append("g")
            .style("opacity", 0)
            .style("display", "none")
            .attr("class", (d) =>
              d.isParent ? "node-text parent-node" : "node-text child-node"
            )
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

  useEffect(() => {
    const { svg } = getNodes();

    // 1 - register reset
    svg.on("dblclick", (event) => {
      if (event.target.tagName === "svg") {
        zoomTo(centerZoom(width), height / 2);
      } else {
        handleNodeDoubleClickZoom(event);
      }
    });
    // 2 - initialize centering
    zoomTo(centerZoom(width), height / 2); // initial centering

    svg.on("click", (event) => {
      if (event.target.tagName === "svg") {
        handleClickShowNames(event);
      }
    });
  }, []);

  useEffect(() => {
    const { svg } = getNodes();

    svg.attr("width", width).attr("height", height);
  }, [size]);

  useEffect(() => {
    draw();
  }, [draw]);

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
        <g className="main">
          <g className="lines"></g>
          <g className="nodes"></g>
        </g>
      </svg>
    </StyledSVGContainer>
  );
};

export default NetworkGraph;
