import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

/*
    Authorized user route protection:
    - Fetches information about the currently logged-in user from AuthContext.
    - If data is loading (loading = true), it temporarily renders nothing.
    - If the user is logged in — it renders nested routes (Outlet).
    - If not logged in — it redirects them to the login page (/login).
    Usage:
    <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
    </Route>
*/

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
