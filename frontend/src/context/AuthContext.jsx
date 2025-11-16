import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

/*
Globalny kontekst autoryzacji użytkownika

Odpowiada za:
 - przechowywanie stanu uwierzytelnienia (token + dane użytkownika),
 - logowanie użytkownika (login),
 - wylogowywanie (logout),
 - automatyczne pobieranie danych użytkownika na podstawie tokenu,
 - przechowywanie tokenu w localStorage, aby przetrwał odświeżenie strony.

Zachowanie:
 - Przy starcie aplikacji pobiera token z localStorage i próbuje pobrać aktualne dane
   użytkownika z backendu /user.
 - Jeśli token jest nieprawidłowy lub zapytanie zwróci błąd — automatycznie wylogowuje.
 - loading = true oznacza, że trwa walidacja lub pobieranie danych użytkownika.
*/

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const logout = () => {
    console.log("User: ", { user });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setLoading(false);
    console.log("Logged out");
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get("http://localhost:3000/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
      } catch (err) {
        console.log(err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
