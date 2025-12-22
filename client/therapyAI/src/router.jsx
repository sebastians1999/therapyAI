import { createBrowserRouter } from "react-router-dom";
import Signup from "./componenets/Signup";
import Signin from "./componenets/Signin";
import Dashboard from "./componenets/Dashboard";
import App from "./App";

export const router = createBrowserRouter([
    { path: "/", element: <App /> },
    { path: "/signup", element: <Signup /> },
    { path: "/signin", element: <Signin /> },
    { path: "/dashboard", element: <Dashboard /> },
]);