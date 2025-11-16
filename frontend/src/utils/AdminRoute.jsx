import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

/*
    Działanie:
    - Pobiera informacje o aktualnie zalogowanym użytkowniku z AuthContext.
    - Jeśli trwa ładowanie danych (loading = true), tymczasowo nie renderuje nic,
    - Jeśli administrator jest zalogowany — renderuje zagnieżdżone trasy (Outlet).
    - Jeśli nie jest zalogowany — przekierowuje go na stronę logowania (/login).
    Użycie:
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


