import { Navigate, Outlet } from "react-router-dom";
import { getToken, isAdmin } from "../../utils/auth";

function ProtectedRoute() {

    const token = getToken();

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (!isAdmin()) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;