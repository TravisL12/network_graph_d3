import NetworkGraph from "../NetworkGraph";
import styled from "styled-components";
import { buildNetworkData } from "../../getData";

const SAppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background: #2a3747;
  color: white;
`;

const StyledAppInner = styled.div`
  /* position: relative; */
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const SHeader = styled.div`
  height: 50px;
  width: 100%;
  background: linear-gradient(90deg, #06505a 0%, #194451 100%);
`;

const SBody = styled.div`
  flex: 1;
`;

const SSidebarContainer = styled.div`
  height: 100%;
  padding: 20px;
`;

const SSidebarInner = styled.div`
  background: white;
  padding: 10px;
  height: 100%;
  width: 300px;
  border-radius: 6px;
  background: linear-gradient(171.36deg, #1d4250 0%, #06515a 100%);
`;

const App = () => {
  return (
    <SAppContainer>
      <NetworkGraph data={buildNetworkData()} />
      <StyledAppInner>
        <SHeader />
        <SBody>
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
        </SBody>
      </StyledAppInner>
    </SAppContainer>
  );
};

export default App;
