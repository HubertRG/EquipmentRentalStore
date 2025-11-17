import React, { useEffect, useState } from "react";
import {
  FaSun,
  FaMoon,
  FaHome,
  FaBookOpen,
  FaUser,
  FaUserPlus,
  FaUserCheck,
} from "react-icons/fa";
import { FiLogOut, FiMail } from "react-icons/fi";
import { RiAdminFill } from "react-icons/ri";
import { LuNotebookPen } from "react-icons/lu";
import { IoMdBasket } from "react-icons/io";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "../../index.css";

/**
Główny pasek nawigacyjny aplikacji

Funkcje:
 - obsługa trybu jasnego/ciemnego (zapisywanego w localStorage),
 - wyświetlanie linków nawigacyjnych w zależności od zalogowania użytkownika,
 - panel użytkownika z dropdown menu (logowanie, rejestracja, panel admina),
 - integracja z Flowbite (dropdown + menu mobilne),
 - automatyczna weryfikacja tokenu przy zmianie stanu autoryzacji.
*/

export default function Navbar() {
  // Inicjalizacja trybu ciemnego na podstawie localStorage
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const navLinkClass = ({ isActive }) =>
    `flex flex-col items-center py-2 px-3 rounded-sm md:p-0 transition-colors duration-200 ${
      isActive
        ? "text-white bg-green-800 md:bg-transparent md:text-green-400 md:dark:text-green-300"
        : "text-gray-900 hover:bg-green-400 md:hover:text-black dark:text-gray-300 md:dark:hover:text-green-400 dark:hover:bg-gray-700"
    }`;

  const dropDownClass = ({ isActive }) =>
    `flex flex-row gap-2 px-4 py-2 text-sm ${
      isActive
        ? "bg-gray-100 dark:bg-gray-600"
        : "hover:bg-gray-100 dark:hover:bg-gray-600"
    } text-gray-700 dark:text-gray-200`;

  // Synchronizacja motywu z dokumentem + zapis do localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Inicjalizacja komponentów Flowbite (dropdowns, mobile menu)
  useEffect(() => {
    import("flowbite").then(({ initFlowbite }) => initFlowbite());
  }, []);

  // Sprawdzenie poprawności tokenu — jeśli nieaktualny, następuje automatyczne wylogowanie
  useEffect(() => {
    const checkUser = async () => {
      if (!localStorage.getItem("token")) {
        return;
      }
      try {
        const { data } = await axios.get("http://localhost:3000/user", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } catch (err) {
        console.log(err);
        logout();
      }
    };
    checkUser();
  }, [localStorage.getItem("token")]);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Wylogowanie + przekierowanie na stronę główną
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <nav className="bg-white text-green-950 border-gray-200 dark:bg-green-950 transition-colors duration-300">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <NavLink to="/" className="flex flex-row gap-3" end>
            <img src="/logo.jpg" className="h-8" alt="Avanti Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-black dark:text-white">
              Avanti
            </span>
          </NavLink>
          <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-green-950 hover:bg-green-600 dark:hover:bg-green-800 transition-colors duration-300 cursor-pointer"
              >
                {darkMode ? (
                  <FaSun className="text-yellow-400" />
                ) : (
                  <FaMoon className="text-gray-900 dark:text-white" />
                )}
              </button>
              
              {/* Jeśli użytkownik jest zalogowany — pokaż dropdown z profilem
                W przeciwnym razie — pokaz opcje logowania / rejestracji*/}
              {user ? (
                <>
                  <button
                    type="button"
                    className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 hover:cursor-pointer focus:ring-gray-300 dark:focus:ring-gray-600"
                    id="user-menu-button"
                    aria-expanded="false"
                    data-dropdown-toggle="user-dropdown"
                    data-dropdown-placement="bottom"
                  >
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="w-8 h-8 rounded-full"
                      src={user.profilePicture}
                      alt="user photo"
                    />
                  </button>
                  <div
                    className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600"
                    id="user-dropdown"
                  >
                    <div className="px-4 py-3">
                      <span className="block text-sm text-gray-900 dark:text-white">
                        {user.userName}
                      </span>
                      <span className="block text-sm  text-gray-500 truncate dark:text-gray-400">
                        {user.email}
                      </span>
                    </div>
                    <ul className="py-2" aria-labelledby="user-menu-button">
                      {" "}
                      {user.role === "admin" ? (
                        <li>
                          <NavLink to="/admin" className={dropDownClass} end>
                            <RiAdminFill className="mt-1" /> Panel
                            administratora
                          </NavLink>
                        </li>
                      ) : (
                        <li>
                          <NavLink to="/profile" className={dropDownClass} end>
                            <FaUser className="mt-1" />
                            Panel użytkownika
                          </NavLink>
                        </li>
                      )}
                      <li>
                        <button
                          onClick={handleLogout}
                          className="flex flex-row gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 hover:cursor-pointer"
                        >
                          <FiLogOut className="mt-1" />
                          Wyloguj
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 hover:cursor-pointer focus:ring-gray-300 dark:focus:ring-gray-600"
                    id="user-menu-button"
                    aria-expanded="false"
                    data-dropdown-toggle="user-dropdown"
                    data-dropdown-placement="bottom"
                  >
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="w-8 h-8 rounded-full"
                      src="/logo.jpg"
                      alt="user photo"
                    />
                  </button>
                  <div
                    className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600"
                    id="user-dropdown"
                  >
                    <ul className="py-2" aria-labelledby="user-menu-button">
                      <li>
                        <NavLink to="/login" className={dropDownClass} end>
                          <FaUserCheck className="mt-1" />
                          Logowanie
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/register" className={dropDownClass} end>
                          <FaUserPlus className="mt-1" />
                          Rejestracja
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </>
              )}
              <button
                data-collapse-toggle="navbar-user"
                type="button"
                className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                aria-controls="navbar-user"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 17 14"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M1 1h15M1 7h15M1 13h15"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-user"
          >
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-green-950 md:dark:bg-green-950 dark:border-gray-700 transition-colors duration-300">
              <li>
                <NavLink
                  to="/"
                  className={navLinkClass}
                  aria-current="page"
                  end
                >
                  <FaHome />
                  Strona Główna
                </NavLink>
              </li>
              <li>
                <NavLink to="/catalog" className={navLinkClass} end>
                  <FaBookOpen />
                  Katalog Sprzętu
                </NavLink>
              </li>
              {user ? (
                <li>
                  <NavLink to="/reservations" className={navLinkClass} end>
                    <IoMdBasket />
                    Rezerwacje
                  </NavLink>
                </li>
              ) : (
                <></>
              )}
              <li>
                <NavLink to="/reviews" className={navLinkClass} end>
                  <LuNotebookPen />
                  Recenzje
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className={navLinkClass} end>
                  <FiMail />
                  Kontakt
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.0/flowbite.min.js"></script>
    </>
  );
}
