import Popup from "./popup";
import ntc from "./lib/ntc";
import { RecoilRoot } from "recoil";
import { createRoot } from "react-dom/client";

ntc.init();

function init() {
  const appContainer = document.createElement("div");
  appContainer.id = "root";
  document.body.appendChild(appContainer);
  if (!appContainer) {
    throw new Error("Can not find AppContainer");
  }
  const root = createRoot(appContainer);
  root.render(
    <RecoilRoot>
      <Popup />
    </RecoilRoot>
  );
}

init();
