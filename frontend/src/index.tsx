import ReactDOM from "react-dom/client";
import App from "@/App";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        {/* Sets the resolved color scheme (incl. the OS-resolved one for "system")
            on <html> before the app paints, so there's no flash of the wrong theme. */}
        <InitColorSchemeScript defaultMode="system" attribute="data-mui-color-scheme" />
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
);
