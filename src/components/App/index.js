import * as d3 from "d3";
import NetworkGraph from "../NetworkGraph";
import {
  simpleData,
  buildHiearchy,
  buildNode,
  randomizer,
} from "../../getData";
import {
  SAppContainer,
  StyledAppInner,
  SHeader,
  SSidebarContainer,
  SSidebarInner,
} from "../../styles";
import { useState } from "react";

const App = () => {
  const [data, setData] = useState(buildHiearchy());

  const addNodes = () => {
    const nodes = buildNode(3, true, 1);
    let children = JSON.parse(JSON.stringify(data.children));
    const childIdxs = children.reduce((acc, c, idx) => {
      if (c.children) acc.push(idx);
      return acc;
    }, []);
    if (childIdxs.length > 0) {
      const idx = childIdxs[randomizer(childIdxs.length - 1)];
      children[idx].children = children[idx].children.concat(nodes);
    } else {
      children = children.concat(nodes);
    }
    setData({ ...data, children });
  };

  // const root = d3.hierarchy(data);
  // const nodes = root.descendants();
  // const links = root.links();

  const { nodes, links } = simpleData();

  return (
    <SAppContainer>
      <NetworkGraph nodes={nodes} links={links} />
      <StyledAppInner>
        <SHeader />
        <div style={{ overflow: "auto" }}>
          <SSidebarContainer>
            <SSidebarInner>
              <button onClick={addNodes}>Add Nodes</button>
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
