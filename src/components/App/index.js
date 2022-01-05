import * as d3 from "d3";
import NetworkGraph from "../NetworkGraph";
import { CLICK, darkStrokeColor, HOVER } from "../../constants";
import {
  getColor,
  simpleData,
  generateNodes,
  weightRandomizer,
  randomizer,
  buildGyanData,
} from "../../getData";
import {
  SAppContainer,
  StyledAppInner,
  SHeader,
  SSidebarContainer,
  SSidebarInner,
  StyledAddButton,
  SChildList,
  SChildListItem,
  SParentListItem,
} from "../../styles";
import { useEffect, useState } from "react";

function randomNode(nodes, isParents = false) {
  const n = isParents ? nodes.filter((n) => n.isParent) : nodes;
  const idx = randomizer(n.length - 1);
  return n[idx];
}

const App = () => {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [nodeEvent, setNodeEvent] = useState(null);

  const fetchData = () => {
    fetch(`${process.env.PUBLIC_URL}/data/planets.json`)
      .then((d) => d.json())
      .then((values) => {
        const vals = buildGyanData(values);
        setData(vals);
      });
  };

  useEffect(fetchData, []);

  const { nodes, links } = data;
  const grouped = d3.groups(links, (d) => d.source.id || d.source);
  const nodeLookup = nodes.reduce((acc, d) => {
    acc[d.id || d] = d;
    return acc;
  }, {});

  const findNode = (node) => {
    return nodeLookup?.[node] || node;
  };

  const addLinks = () => {
    const newLinks = [];
    for (let i = 0; i < 5; i++) {
      const source = randomNode(data.nodes);
      const target = randomNode(data.nodes);
      newLinks.push({
        source: source.id || source,
        target: target.id || target,
        color: source.color,
        weight: weightRandomizer(),
      });
    }
    setData({ ...data, links: [...data.links, ...newLinks] });
  };

  const addNodes = (id, parentNode = null) => {
    const copyNodes = [...data.nodes];
    const root = copyNodes.find((node) => (node.id || node) === id);

    if (!root.isParent) {
      root.color = parentNode.isRoot
        ? getColor()
        : darkStrokeColor(parentNode, 0.6);
    }

    root.isParent = true;
    const { nodes: newNodes, links: newLinks } = generateNodes(
      root,
      root.color
    );

    setData({
      nodes: [...copyNodes, ...newNodes],
      links: [...data.links, ...newLinks],
    });
  };

  const mouseEvent = (nodeId, type) => {
    const node = findNode(nodeId);
    setNodeEvent({ type, node });
  };

  if (!data.nodes.length) {
    return "loading";
  }

  return (
    <SAppContainer>
      <NetworkGraph
        nodes={nodes}
        links={links}
        nodeEvent={nodeEvent}
        handleNodeEvent={mouseEvent}
      />
      <StyledAppInner>
        <SHeader />
        <div style={{ overflow: "auto" }}>
          <SSidebarContainer>
            <SSidebarInner>
              <h3>{nodes[0]?.name}</h3>
              {grouped.map(([id, children]) => {
                const parentNode = findNode(id);
                if (!parentNode.isParent) return null;

                return (
                  <ul key={`parent-${id}`}>
                    <SParentListItem
                      onMouseOver={() => mouseEvent(id, HOVER)}
                      onMouseOut={() => mouseEvent(null, HOVER)}
                      style={{
                        background: parentNode.color,
                      }}
                    >
                      <StyledAddButton onClick={() => mouseEvent(id, CLICK)}>
                        {parentNode.name}
                      </StyledAddButton>
                    </SParentListItem>
                    <SChildList>
                      {children.map((child) => {
                        const sNode = findNode(child.source);
                        const cNode = findNode(child.target);
                        return (
                          <SChildListItem
                            key={`child-${cNode.id}-${sNode.id}`}
                            onMouseOver={() => mouseEvent(cNode.id, HOVER)}
                            onMouseOut={() => mouseEvent(null, HOVER)}
                          >
                            <StyledAddButton
                              onClick={() => mouseEvent(cNode.id, CLICK)}
                            >
                              {cNode.name}
                            </StyledAddButton>
                          </SChildListItem>
                        );
                      })}
                    </SChildList>
                  </ul>
                );
              })}
            </SSidebarInner>
          </SSidebarContainer>
        </div>
      </StyledAppInner>
    </SAppContainer>
  );
};

export default App;
