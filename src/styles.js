import styled from "styled-components";

const gyanColors = {
  tealGradient1: "#06505a",
  tealGradient2: "#194451",
  darkBlueGray: "#1d4250",
  otherTealGradient: "#06515a",
};

export const SAppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background: radial-gradient(
    64.7% 64.7% at 51.8% 62.15%,
    #d8f4db 1.68%,
    rgba(225, 244, 216, 0.75) 44.43%,
    #e2faf8 89.7%
  );
`;

export const StyledAppInner = styled.div`
  height: 100%;
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar body body";
  grid-template-rows: 50px 1fr;
  grid-template-columns: 300px 1fr 1fr;
`;

export const SHeader = styled.div`
  position: relative;
  grid-area: header;
  height: 50px;
  width: 100%;
  background: linear-gradient(
    90deg,
    ${gyanColors.tealGradient1} 0%,
    ${gyanColors.tealGradient2} 100%
  );
`;

export const SSidebarContainer = styled.div`
  position: relative;
  grid-area: sidebar;
  height: 100%;
  padding: 20px;
`;

export const SSidebarInner = styled.div`
  background: white;
  padding: 10px;
  height: 100%;
  width: 100%;
  border-radius: 6px;
  background: rgba(171, 218, 220, 0.5);
  backdrop-filter: blur(60px);
`;

export const StyledSVGContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  vertical-align: top;
  overflow: hidden;
`;
