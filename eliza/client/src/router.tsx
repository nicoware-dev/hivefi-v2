import { createBrowserRouter } from "react-router-dom";
import Home from "./Home";
import Layout from "./Layout";
import Chat from "./Chat";
import Analytics from "./pages/analytics";
import Portfolio from "./pages/portfolio";
import Settings from "./pages/settings";
import Agents from "./Agents";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/agents",
        element: <Agents />,
    },
    {
        path: "/app",
        element: <Layout />,
        children: [
            {
                path: "chat/:agentId",
                element: <Chat />,
            },
            {
                path: "analytics",
                element: <Analytics />,
            },
            {
                path: "portfolio",
                element: <Portfolio />,
            },
            {
                path: "settings",
                element: <Settings />,
            },
        ],
    },
]);
