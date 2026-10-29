import { hydrateRoot } from "react-dom/client";
import { App } from "./theme/App";
import "./theme/global.css";
import "./theme/audio.css";
const element = document.getElementById("page-data");
if (element)
  hydrateRoot(
    document.getElementById("app")!,
    <App data={JSON.parse(element.textContent!)} />,
  );
