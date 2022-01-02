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

function randomNode(nodes) {
  const idx = randomizer(nodes.length - 1);
  return nodes[idx];
}

const App = () => {
  const [data, setData] = useState(simpleData());

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
    const root = randomNode(copyNodes);
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

  const { nodes, links } = data;

  // const grouped = d3.groups(links, (d) => d.source.id || d.source);

  return (
    <SAppContainer>
      <NetworkGraph nodes={nodes} links={links} />
      <StyledAppInner>
        <SHeader />
        <div style={{ overflow: "auto" }}>
          <SSidebarContainer>
            <SSidebarInner>
              <button onClick={addNodes}>Add Nodes</button>
              <button onClick={addLinks}>Add Links</button>
              {/* <h3>{data.name}</h3>
              {data.children.map((child) => {
                return (
                  <ul key={`parent-${child.id}`}>
                    <li style={{ background: child.color }}>{child.name}</li>
                    {child.children && (
                      <ul>
                        {child.children.map((child2, idx) => {
                          return <li key={`child-${idx}`}>{child2.name}</li>;
                        })}
                      </ul>
                    )}
                  </ul>
                );
              })} */}
            </SSidebarInner>
          </SSidebarContainer>
        </div>
      </StyledAppInner>
    </SAppContainer>
  );
};

export default App;
