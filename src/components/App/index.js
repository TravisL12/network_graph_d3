import NetworkGraph from "../NetworkGraph";
import styled from "styled-components";
import { buildNetworkData } from "../../getData";

const SNetworkContainer = styled.div`
  position: relative;
  height: 100%;
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
  border-radius: 5px;
`;

const App = () => {
  return (
    <SNetworkContainer>
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
    </SNetworkContainer>
  );
};

export default App;
