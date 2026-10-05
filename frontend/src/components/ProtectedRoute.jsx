import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    const isAllowed =
      allowedRoles.includes(user.role) ||
      (allowedRoles.includes("ADMIN") && (user.role === "ADMIN" || Boolean(user.is_staff) || Boolean(user.is_superuser)));

    if (!isAllowed) {
      return <Navigate to="/" replace />;
    }
  }

  return children;

}

export default ProtectedRoute;