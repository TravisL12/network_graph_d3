import NetworkGraph from "../NetworkGraph";
import { buildNetworkData, buildHiearchy } from "../../getData";
import {
  SAppContainer,
  StyledAppInner,
  SHeader,
  SSidebarContainer,
  SSidebarInner,
} from "../../styles";

const App = () => {
  return (
    <SAppContainer>
      <NetworkGraph data={buildHiearchy()} />
      <StyledAppInner>
        <SHeader />
        <div>
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
        </div>
      </StyledAppInner>
    </SAppContainer>
  );
};

export default App;
