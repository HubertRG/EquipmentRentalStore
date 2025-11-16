import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

/*
    Działanie:
    - Pobiera informacje o aktualnie zalogowanym użytkowniku z AuthContext.
    - Jeśli trwa ładowanie danych (loading = true), tymczasowo nie renderuje nic,
    - Jeśli użytkownik jest zalogowany — renderuje zagnieżdżone trasy (Outlet).
    - Jeśli nie jest zalogowany — przekierowuje go na stronę logowania (/login).
    Użycie:
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
