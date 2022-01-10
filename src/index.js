import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";
import { useWindowSize } from "./useWindow";

const Entry = () => {
  const size = useWindowSize();
  return size.height ? <App size={size} /> : "loading";
};

ReactDOM.render(
  <React.StrictMode>
    <Entry />
  </React.StrictMode>,
  document.getElementById("root")
);
