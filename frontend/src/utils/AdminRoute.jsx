import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

/*
    Admin route protection:
    - Fetches information about the currently logged-in user from AuthContext.
    - If data is loading (loading = true), it temporarily renders nothing.
    - If the administrator is logged in — it renders nested routes (Outlet).
    - If not logged in — it redirects them to the login page (/login).
    Use:
    <Route element={<AdminRoute />}>
        <Route path="/admin" element={<Admin />} />
    </Route>
*/

function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user && user.role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}

export default AdminRoute;


