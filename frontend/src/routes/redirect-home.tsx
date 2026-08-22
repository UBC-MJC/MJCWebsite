import { Navigate } from "react-router";

export default function RedirectHome() {
    return <Navigate to="/" replace />;
}
