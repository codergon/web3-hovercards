import App from "./App";
import "./styles/index.scss";
import { createRoot } from "react-dom/client";
import AddressInfoProvider from "./context/AddressInfoContext";

function init() {
  const appContainer = document.createElement("div");
  appContainer.id = "web3-hovercard-modal";
  appContainer.style.zIndex = "2147483647";
  document.body.appendChild(appContainer);
  if (!appContainer) return;
  const root = createRoot(appContainer);
  root.render(
    <AddressInfoProvider>
      <App />
    </AddressInfoProvider>
  );
}

init();
