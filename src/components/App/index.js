import NetworkGraph from "../NetworkGraph";
import styled from "styled-components";
import { useEffect, useState } from "react";

const SNetworkContainer = styled.div``;

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await fetch(`${process.env.PUBLIC_URL}/data_network.json`)
        .then((d) => d.json())
        .then((values) => {
          setData(values);
        });
    };
    fetchData();
  }, []);

  return (
    <SNetworkContainer>
      {data && <NetworkGraph data={data} />}
    </SNetworkContainer>
  );
}

export default App;
