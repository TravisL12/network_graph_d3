import NetworkGraph from "../NetworkGraph";
import styled from "styled-components";
import { buildNetworkData } from "../../getData";

const SNetworkContainer = styled.div``;

function App() {
  return (
    <SNetworkContainer>
      <NetworkGraph data={buildNetworkData()} />
    </SNetworkContainer>
  );
}

export default App;
