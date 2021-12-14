import NetworkGraph from "../NetworkGraph";
import styled from "styled-components";
import { buildNetworkData } from "../../getData";

const SAppContainer = styled.div`
  position: relative;
  height: 100vh;
  width: 100vw;
  background: #eee;
`;

const SSidebarContainer = styled.div`
  position: relative;
  height: 100vh;
  width: 300px;
  padding: 20px;
`;

const SSidebarInner = styled.div`
  background: white;
  height: 100%;
  border: 4px solid #4e4e4e;
  box-shadow: 0 0 0 0 #4e4e4e;
  border-radius: 10px;
`;

const App = () => {
  return (
    <SAppContainer>
      <NetworkGraph data={buildNetworkData()} />
      <SSidebarContainer>
        <SSidebarInner>
          <ul>
            <li>All the things</li>
            <li>All the things</li>
            <li>All the things</li>
            <li>All the things</li>
          </ul>
        </SSidebarInner>
      </SSidebarContainer>
    </SAppContainer>
  );
};

export default App;
