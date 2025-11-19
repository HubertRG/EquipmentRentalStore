import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

/*
Global user authorization context

Responsible for:
 - storing authentication state (token + user data),
 - user login (login),
 - user logout (logout),
 - automatically fetching user data based on the token,
 - storing the token in localStorage so it persists upon page refresh.

Behavior:
 - On application startup, it retrieves the token from localStorage and attempts to
   fetch current user data from the backend at /user.
 - If the token is invalid or the request returns an error — it automatically logs out.
 - loading = true means that user validation or data fetching is currently in progress.
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
