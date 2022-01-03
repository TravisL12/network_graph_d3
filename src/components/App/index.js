import * as d3 from "d3";
import NetworkGraph from "../NetworkGraph";
import { getColor, simpleData, generateNodes } from "../../getData";
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
import { useState } from "react";
import { randomNode } from "../NetworkGraph/helpers";

const App = () => {
  const [data, setData] = useState(simpleData());
  const [hoverId, setHoverId] = useState(null);

  const { nodes, links } = data;
  const grouped = d3.groups(links, (d) => d.source.id || d.source);
  const nodeLookup = nodes.reduce((acc, d) => {
    acc[d.id || d] = d;
    return acc;
  }, {});

  const findNode = (node) => {
    return typeof node === "number" ? nodeLookup[node] : node;
  };

  const addLinks = () => {
    const newLinks = [];
    for (let i = 0; i < 5; i++) {
      const source = randomNode(data.nodes);
      const target = randomNode(data.nodes);
      newLinks.push({
        source: source.id || source,
        target: target.id || target,
      });
    }
    setData({ ...data, links: [...data.links, ...newLinks] });
  };

  const addNodes = (id) => {
    const copyNodes = [...data.nodes];
    const root = copyNodes.find((node) => (node.id || node) === id);

    if (!root.isParent) {
      root.color = getColor();
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

  const mouseOver = (nodeId) => {
    const node = findNode(nodeId);
    setHoverId(node);
  };

  return (
    <SAppContainer>
      <NetworkGraph nodes={nodes} links={links} hoverNode={hoverId} />
      <StyledAppInner>
        <SHeader />
        <div style={{ overflow: "auto" }}>
          <SSidebarContainer>
            <SSidebarInner>
              <div>
                <StyledAddButton onClick={addLinks}>Add Links</StyledAddButton>
              </div>
              <h3>{nodes[0]?.name}</h3>
              {grouped.map(([id, children]) => {
                const parentNode = findNode(id);

                return (
                  <ul key={`parent-${id}`}>
                    <SParentListItem
                      onMouseOver={() => mouseOver(id)}
                      onMouseOut={() => setHoverId(null)}
                      style={{
                        background: parentNode.color,
                      }}
                    >
                      <div>{parentNode.name}</div>
                      <StyledAddButton onClick={() => addNodes(parentNode.id)}>
                        Add
                      </StyledAddButton>
                    </SParentListItem>
                    <SChildList>
                      {children.map((child) => {
                        const sNode = findNode(child.source);
                        const cNode = findNode(child.target);
                        return (
                          <SChildListItem
                            key={`child-${cNode.id}-${sNode.id}`}
                            onMouseOver={() => mouseOver(cNode.id)}
                            onMouseOut={() => setHoverId(null)}
                          >
                            <div>{cNode.name}</div>
                            <StyledAddButton onClick={() => addNodes(cNode.id)}>
                              Add
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
