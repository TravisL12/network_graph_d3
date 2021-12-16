import TreeGraph from "../TreeGraph";
import { buildHiearchy, buildNode } from "../../getData";
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
    children = data.children.concat(nodes);
    setData({ ...data, children });
  };

  return (
    <SAppContainer>
      <TreeGraph data={data} />
      <StyledAppInner>
        <SHeader />
        <div>
          <SSidebarContainer>
            <SSidebarInner>
              <button onClick={addNodes}>Add Nodes</button>
              <ul>
                <li>All the things</li>
                <li>All the things</li>
                <li>All the things</li>
                <li>All the things</li>
              </ul>
            </SSidebarInner>
          </SSidebarContainer>
        </div>
      </StyledAppInner>
    </SAppContainer>
  );
};

export default App;
