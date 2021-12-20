import { ForceGraph2D } from "react-force-graph";

import NetworkGraph from "../NetworkGraph";
import {
  buildGyanStratify,
  buildGyanData,
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
import { useState, useEffect } from "react";

const App = () => {
  const [data, setData] = useState();

  const fetchData = () => {
    fetch(`${process.env.PUBLIC_URL}/data/robotics.json`)
      .then((d) => d.json())
      .then((values) => {
        const d = buildGyanStratify(values);
        setData(d);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!data) return "fetching";

  return (
    <SAppContainer>
      <ForceGraph2D
        graphData={{ nodes: Object.values(data.nodes), links: data.links }}
      />
      <StyledAppInner>
        <SHeader />
        <div>
          <SSidebarContainer>
            <SSidebarInner>
              <h3>hi</h3>
              {/* <button onClick={addNodes}>Add Nodes</button> */}
              {/* {data.children.map((child) => {
                return (
                  <ul key={`parent-${child.parent_id}`}>
                    <li>ID: {child.id}</li>
                    {child.children && (
                      <ul>
                        {child.children.map((child2) => {
                          return (
                            <li key={`child-${child2.child_id}`}>
                              ID: {child2.child_id}
                            </li>
                          );
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
