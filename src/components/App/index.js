import * as d3 from "d3";
import NetworkGraph from "../NetworkGraph";
import { getColor, simpleData, generateNodes } from "../../getData";
import {
  SAppContainer,
  StyledAppInner,
  SHeader,
  SSidebarContainer,
  SSidebarInner,
} from "../../styles";
import { useState } from "react";
import { randomNode } from "../NetworkGraph/helpers";

const App = () => {
  const [data, setData] = useState(simpleData());

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

    root.isParent = true;
    const color = root.isRoot ? root.color : getColor();
    const { nodes: newNodes, links: newLinks } = generateNodes(root, color);

    setData({
      nodes: [...copyNodes, ...newNodes],
      links: [...data.links, ...newLinks],
    });
  };

  return (
    <SAppContainer>
      <NetworkGraph nodes={nodes} links={links} />
      <StyledAppInner>
        <SHeader />
        <div style={{ overflow: "auto" }}>
          <SSidebarContainer>
            <SSidebarInner>
              <div>
                <button onClick={addLinks}>Add Links</button>
              </div>
              <h3>{nodes[0]?.name}</h3>
              {grouped.map(([id, children]) => {
                const parentNode = findNode(id);

                return (
                  <ul key={`parent-${id}`}>
                    <li
                      style={{
                        background: parentNode.color,
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "2px 4px",
                      }}
                    >
                      <div>{parentNode.name}</div>
                      <button onClick={() => addNodes(parentNode.id)}>
                        Add
                      </button>
                    </li>
                    <ul style={{ padding: "2px 6px 2px 10px" }}>
                      {children.map((child) => {
                        const sNode = findNode(child.source);
                        const cNode = findNode(child.target);
                        return (
                          <li
                            key={`child-${cNode.id}-${sNode.id}`}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>{cNode.name}</div>
                            <button onClick={() => addNodes(cNode.id)}>
                              Add
                            </button>
                          </li>
                        );
                      })}
                    </ul>
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
