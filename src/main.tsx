import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Self-hosting fonts
import "@fontsource/fredoka-one";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
