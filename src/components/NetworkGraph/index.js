import * as d3 from "d3";
import { throttle } from "lodash";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { positionLink, getHeightWidth } from "./helpers";
import { StyledSVGContainer } from "../../styles";

export const HOVER = "hover";
export const CLICK = "click";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 12;
const CLICK_ZOOM_LEVEL = 3;
const UPDATE_DURATION = 500;

const CIRCLE_BASE_RADIUS = 8;
const ROOT_BASE_RADIUS = CIRCLE_BASE_RADIUS * 2;
const CHILD_CIRCLE_BASE_RADIUS = CIRCLE_BASE_RADIUS * (7 / 8);

const COLLISION_DISTANCE = CIRCLE_BASE_RADIUS * 3;
const STROKE_COLOR = "#177E89";
const WIDE_STROKE_WIDTH = "4px";
const REGULAR_STROKE_WIDTH = "2px";
const strokeColor = (d) => d3.color(d.color).darker(1);
const darkStrokeColor = (d) => d3.color(d.color).darker(1.5);

const LINK_STROKE_WIDTH = 0.25;
const LINK_DISTANCE = 200;

const ARM_STRENGTH = 50;
const ARM_MAX_DISTANCE = 200;

const ALPHA_MIN = 0.1; // stop speed
const ALPHA = 0.5; // start speed
const ALPHA_DECAY = 0.05; // speed to decay to stop

const xMargin = 4;
const yMargin = 0;

const hoverCircleCheck = (isHovered, r) => {
  return isHovered ? r * 2 : r;
};

const getNodeRadius = (d) => {
  return d.isRoot
    ? ROOT_BASE_RADIUS
    : d.isParent
    ? CIRCLE_BASE_RADIUS
    : CHILD_CIRCLE_BASE_RADIUS;
};

function NetworkGraph({ nodes, links, nodeEvent, handleNodeEvent }) {
  const graphRef = useRef();
  const zoom = d3
    .zoom()
    .scaleExtent([MIN_ZOOM, MAX_ZOOM])
    .on("zoom", (event) => {
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
    const { zoomRect } = getNodes();
    const { width, height } = getHeightWidth();
    zoomRect.call(zoom).call(zoom.translateTo, width / 2, height / 2);
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
    return d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .id(({ id }) => id)
          .distance(LINK_DISTANCE)
          .strength(2)
      )
      .force(
        "charge",
        d3.forceManyBody().strength(ARM_STRENGTH).distanceMax(ARM_MAX_DISTANCE)
      )
      .force(
        "collision",
        d3.forceCollide(COLLISION_DISTANCE + 1).iterations(10)
      )
      .on("tick", ticked)
      .on("end", () => {
        nodes.forEach((node) => {
          node.fx = node.x;
          node.fy = node.y;
        });
        simulation.stop();
      });
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
      const hoverDuration = 250;

      const linkSelection = link.transition().duration(hoverDuration);
      const circleSelection = node
        .select(".node circle")
        .transition()
        .duration(hoverDuration);

      const textSelection = node
        .select(".node-text")
        .transition()
        .duration(hoverDuration);

      if (selectedNode?.isParent) {
        const childIds = links
          .filter((link) => link.source.id === selectedNode.id)
          .map(({ target }) => target.id);

        linkSelection.attr("stroke", (d) => {
          return [selectedNode.id, ...childIds].includes(d.source.id)
            ? darkStrokeColor(d)
            : strokeColor(d);
        });
        circleSelection
          .attr("r", (d) => {
            return hoverCircleCheck(
              [selectedNode.id, ...childIds].includes(d.id),
              getNodeRadius(d)
            );
          })
          .attr("stroke", (d) =>
            [selectedNode.id, ...childIds].includes(d.id)
              ? darkStrokeColor(d)
              : strokeColor(d)
          )
          .attr("stroke-width", (d) =>
            [selectedNode.id, ...childIds].includes(d.id)
              ? WIDE_STROKE_WIDTH
              : REGULAR_STROKE_WIDTH
          );

        textSelection.style("opacity", (d) =>
          [selectedNode.id, ...childIds].includes(d.id) ? 100 : 0
        );
      } else {
        // resets all nodes if not a parent (or if no node selected)
        circleSelection
          .attr("r", (d) =>
            hoverCircleCheck(d.id === selectedNode?.id, getNodeRadius(d))
          )
          .attr("stroke", (d) =>
            d.id === selectedNode?.id ? darkStrokeColor(d) : strokeColor(d)
          )
          .attr("stroke-width", (d) =>
            d.id === selectedNode?.id ? WIDE_STROKE_WIDTH : REGULAR_STROKE_WIDTH
          );
        textSelection.style("opacity", (d) =>
          d.id === selectedNode?.id ? 100 : 0
        );
        linkSelection.attr("stroke", (d) => d.color);
      }
    },
    [getNodes, links]
  );

  const zoomTo = (x, y) => {
    const { zoomRect } = getNodes();
    zoomRect
      .call(zoom)
      .transition()
      .duration(200)
      .call(zoom.translateTo, x, y)
      .transition()
      .duration(500)
      .call(zoom.scaleTo, CLICK_ZOOM_LEVEL);
  };

  const handleNodeClickZoom = (event) => {
    const { x, y } = d3.select(event.target.parentNode).data()[0];
    zoomTo(x, y);
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
      .join((enter) => {
        const path = enter
          .append("path")
          .attr("class", "line")
          .attr("stroke", d3.color(STROKE_COLOR).brighter(1.5))
          .style("stroke-width", `${LINK_STROKE_WIDTH * 10}px`)
          .style("fill", "none")
          .call((e) => {
            e.transition()
              .duration(UPDATE_DURATION * 3)
              .attr("stroke", (d) => d3.color(d.color).darker(1))
              .style(
                "stroke-width",
                (d) => `${d.weight * LINK_STROKE_WIDTH}px`
              );
          });
        return path;
      });

    node
      .data(nodes, (d) => {
        return d.id;
      })
      .join(
        (enter) => {
          const g = enter.append("g").attr("class", "node");

          g.append("circle")
            .attr("r", (d) => getNodeRadius(d))
            .style(
              "fill",
              (d) => d.color || d3.color(d.parent.color).brighter(1.6)
            )
            .attr("stroke", (d) => d3.color(d.color).darker(1))
            .attr("stroke-width", REGULAR_STROKE_WIDTH)
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

          gText
            .append("text")
            .text((d) => d.name)
            .join("text")
            .style("font-size", (d) => (d.isParent ? "16px" : "12px"))
            .each(function (d) {
              d.bbox = this.getBBox();
            });
          gText.selectAll("text").remove();

          gText
            .append("rect")
            .style("fill", "white")
            .style("opacity", 0.8)
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
            .text((d) => d.name)
            .join("text")
            .style("font-size", (d) => (d.isParent ? "16px" : "12px"))
            .attr("fill", "black")
            .style("text-anchor", "middle")
            .attr("transform", `translate(0, -${CIRCLE_BASE_RADIUS})`);

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
      zoomTo(x, y);
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
}

export default NetworkGraph;
