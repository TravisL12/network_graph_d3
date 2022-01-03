import * as d3 from "d3";
import NetworkGraph from "../NetworkGraph";
import { getColor, simpleData, generateNodes, randomizer } from "../../getData";
import {
  SAppContainer,
  StyledAppInner,
  SHeader,
  SSidebarContainer,
  SSidebarInner,
} from "../../styles";
import { useState } from "react";

function randomNode(nodes, isParents = false) {
  const n = isParents ? nodes.filter((n) => n.isParent) : nodes;
  const idx = randomizer(n.length - 1);
  return n[idx];
}
let rootCount = 0;
let parentCount = 0;
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

  const addNodes = () => {
    const copyNodes = [...data.nodes];
    const root =
      rootCount < 3 ? nodes[0] : randomNode(copyNodes, parentCount > 10);
    rootCount += 1;
    parentCount += 1;

    root.isParent = true;

    const { nodes: newNodes, links: newLinks } = generateNodes(
      root,
      getColor()
    );

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
                <button onClick={addNodes}>Add Nodes</button>
                <button onClick={addLinks}>Add Links</button>
              </div>
              <h3>{nodes[0]?.name}</h3>
              {grouped.map(([id, children]) => {
                const parentNode = findNode(id);

                return (
                  <ul key={`parent-${id}`}>
                    <li style={{ background: parentNode.color }}>
                      {parentNode.name}
                    </li>
                    <ul>
                      {children.map((child) => {
                        const sNode = findNode(child.source);
                        const cNode = findNode(child.target);
                        return (
                          <li key={`child-${cNode.id}-${sNode.id}`}>
                            {cNode.name}
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
