// src/main.jsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PrimeReactProvider } from "primereact/api";
import "./i18n"; // Import cấu hình i18n

import App from "./App.jsx";
import "./index.css"; // Tất cả CSS đã nằm gọn trong này

createRoot(document.getElementById("root")).render(
  <PrimeReactProvider value={{ ripple: true }}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </PrimeReactProvider>
);
