import NetworkGraph from "../NetworkGraph";
import { buildHiearchy, buildNode, randomizer } from "../../getData";
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
    const nodes = buildNode(3);
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

  return (
    <SAppContainer>
      <NetworkGraph data={data} />
      <StyledAppInner>
        <SHeader />
        <div>
          <SSidebarContainer>
            <SSidebarInner>
              <button onClick={addNodes}>Add Nodes</button>
              <ul>
                <li>Search Result 1</li>
                <li>Search Result 2</li>
                <li>Search Result 3</li>
                <li>Search Result 4</li>
              </ul>
            </SSidebarInner>
          </SSidebarContainer>
        </div>
      </StyledAppInner>
    </SAppContainer>
  );
};

export default App;
