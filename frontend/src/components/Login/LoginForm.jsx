import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { NavLink, useNavigate } from "react-router";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";

/*
  Komponent formularza logowania.
  Odpowiada za obsługę logowania użytkownika,
  walidację danych, wysyłanie żądania do backendu,
  obsługę błędów oraz zapis tokenu i danych użytkownika.
*/

function LoginForm() {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  // Aktualizuje pola formularza po wpisaniu danych przez użytkownika
  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };
  const navigate = useNavigate();
  const { login } = useAuth();
  // Obsługa logowania po kliknięciu przycisku "Zaloguj"
  // Wysyła żądanie do backendu i przechowuje token użytkownika
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "http://localhost:3000/authorization/login";
      const { data: res } = await axios.post(url, data);
      login({
        token: res.token,
        user: res.user,
      });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      console.log("Logged in");
      navigate("/");
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };
  return (
    <>
      <div className="w-full max-w-md p-8 text-black dark:text-white bg-white rounded-lg shadow-md dark:bg-green-950">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            <RiLockPasswordFill className="inline-block mr-2" />
            Zaloguj się
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <MdEmail className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Adres email"
              onChange={handleChange}
              value={data.email}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="relative">
            <RiLockPasswordFill className="absolute top-3 left-3 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Hasło"
              onChange={handleChange}
              value={data.password}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 hover:cursor-pointer text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <RiLockPasswordFill className="mr-2" />
            Zaloguj
          </button>

          <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
            Nie masz konta?{" "}
            <NavLink
              to="/register"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Zarejestruj się
            </NavLink>
          </p>
        </form>
      </div>
    </>
  );
}

export default LoginForm;
