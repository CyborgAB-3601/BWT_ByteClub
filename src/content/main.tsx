import React from "react";
import ReactDOM from "react-dom/client";
import App from "./ui/App";
import styles from "./styles.css?raw";

const ROOT_ID = "ecosense-shadow-host";

const ensureHost = () => {
  const existing = document.getElementById(ROOT_ID);
  if (existing) return existing;

  const host = document.createElement("div");
  host.id = ROOT_ID;
  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.zIndex = "2147483647";
  host.style.pointerEvents = "none";
  document.documentElement.appendChild(host);
  return host;
};

const host = ensureHost();
const shadow = host.attachShadow({ mode: "open" });

const styleEl = document.createElement("style");
styleEl.textContent = styles;
shadow.appendChild(styleEl);

const mount = document.createElement("div");
mount.className = "ecosense-root";
mount.style.position = "fixed";
mount.style.right = "18px";
mount.style.bottom = "18px";
mount.style.pointerEvents = "auto";
shadow.appendChild(mount);

ReactDOM.createRoot(mount).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
