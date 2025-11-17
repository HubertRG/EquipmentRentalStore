import React, { useState, useEffect } from "react";
import { NavLink, useNavigate} from "react-router";
import axios from "axios";
import { FaUser, FaUserAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FiPhone } from "react-icons/fi";
import { RiLockPasswordFill } from "react-icons/ri";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/* 
    Komponent formularza rejestracji z walidacją po stronie klienta,
    obsługą błędów API oraz informacją o sukcesie.
*/

function RegisterForm() {
    const navigate = useNavigate();
  // Stan przechowujący wartości pól formularza
  const [data, setData] = useState({
    fullName: "",
    userName: "",
    email: "",
    phonenumber: "",
    password: "",
    confirmPassword: "",
  });
  // Stan przechowujący komunikaty błędów (walidacja + backend)
  const [errors, setErrors] = useState("");
  // Aktualizacja pola + czyszczenie błędu powiązanego z tym polem
  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
    if (errors[input.name]) {
      setErrors((prev) => ({ ...prev, [input.name]: "" }));
    }
  };
  const handleConfirmPasswordChange = ({ currentTarget: input }) => {
    setData((prev) => ({ ...prev, confirmPassword: input.value }));
  };
  // Funkcja walidująca wszystkie pola formularza
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{9}$/;
    const usernameRegex = /^[a-zA-Z0-9]+$/;

    if (!data.fullName.trim()) {
      newErrors.fullName = "Pełne imię jest wymagane";
    } else if (data.fullName.length < 3 || data.fullName.length > 50) {
      newErrors.fullName = "Imię musi mieć 3-50 znaków";
    }

    if (!data.userName.trim()) {
      newErrors.userName = "Nazwa użytkownika jest wymagana";
    } else if (data.userName.length < 3 || data.userName.length > 30) {
      newErrors.userName = "Nazwa musi mieć 3-30 znaków";
    } else if (!usernameRegex.test(data.userName)) {
      newErrors.userName = "Tylko litery i cyfry są dozwolone";
    }

    if (!data.email.trim()) {
      newErrors.email = "Email jest wymagany";
    } else if (!emailRegex.test(data.email)) {
      newErrors.email = "Nieprawidłowy format email";
    }

    if (!data.phonenumber.trim()) {
      newErrors.phonenumber = "Numer telefonu jest wymagany";
    } else if (!phoneRegex.test(data.phonenumber)) {
      newErrors.phonenumber = "Numer musi mieć 9 cyfr";
    }

    if (!data.password.trim()) {
      newErrors.password = "Hasło jest wymagane";
    } else {
      const passwordErrors = [];
      if (data.password.length < 8) passwordErrors.push("Minimum 8 znaków");
      if (data.password.length > 30) passwordErrors.push("Maksimum 30 znaków");
      if (!/[a-z]/.test(data.password))
        passwordErrors.push("Jedna mała litera");
      if (!/[A-Z]/.test(data.password))
        passwordErrors.push("Jedna duża litera");
      if (!/[0-9]/.test(data.password)) passwordErrors.push("Jedna cyfra");
      if (!/[^a-zA-Z0-9]/.test(data.password))
        passwordErrors.push("Jednen znak specjalny");

      if (passwordErrors.length > 0) {
        newErrors.password = `Hasło musi zawierać: ${passwordErrors.join(
          ", "
        )}`;
      }
    }

    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Hasła nie są identyczne";
    }

    return newErrors;
  };
  // Blokuje przeładowanie strony i uruchamia walidację
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const url = "http://localhost:3000/authorization/signup";
      const { confirmPassword, ...dataToSend } = data;
      await axios.post(url, dataToSend);
      await MySwal.fire({
        icon: "success",
        title: "Rejestracja udana!",
        text: "Możesz teraz się zalogować.",
        confirmButtonText: "Przejdź do logowania",
      });
      setErrors({});
      setData({
        fullName: "",
        userName: "",
        email: "",
        phonenumber: "",
        password: "",
        confirmPassword: "",
      });
      navigate("/login");
    } catch (error) {
      if (error.response?.status >= 400 && error.response?.status <= 500) {
        setErrors({ general: error.response.data.message });
      }
    }
  };
  return (
    <div className="w-full max-w-md p-8 text-black dark:text-white bg-white rounded-lg shadow-md dark:bg-green-950">

      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {errors.general}
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          <RiLockPasswordFill className="inline-block mr-2" />
          Zarejestruj się
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <FaUser className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              name="fullName"
              placeholder="Pełne imię"
              onChange={handleChange}
              value={data.fullName}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              } focus:ring-green-500 dark:bg-gray-700 dark:text-white`}
            />
          </div>
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <FaUserAlt className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              name="userName"
              placeholder="Nazwa użytkownika"
              onChange={handleChange}
              value={data.userName}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 ${
                errors.userName ? "border-red-500" : "border-gray-300"
              } focus:ring-green-500 dark:bg-gray-700 dark:text-white`}
            />
          </div>
          {errors.userName && (
            <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <MdEmail className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Adres email"
              onChange={handleChange}
              value={data.email}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 ${
                errors.email ? "border-red-500" : "border-gray-300"
              } focus:ring-green-500 dark:bg-gray-700 dark:text-white`}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <FiPhone className="absolute top-3 left-3 text-gray-400" />
            <input
              type="tel"
              name="phonenumber"
              placeholder="Numer telefonu"
              onChange={handleChange}
              value={data.phonenumber}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 ${
                errors.phonenumber ? "border-red-500" : "border-gray-300"
              } focus:ring-green-500 dark:bg-gray-700 dark:text-white`}
              pattern="[0-9]{9}"
            />
          </div>
          {errors.phonenumber && (
            <p className="text-red-500 text-sm mt-1">{errors.phonenumber}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <RiLockPasswordFill className="absolute top-3 left-3 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Hasło"
              onChange={handleChange}
              value={data.password}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 ${
                errors.password ? "border-red-500" : "border-gray-300"
              } focus:ring-green-500 dark:bg-gray-700 dark:text-white`}
            />
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <RiLockPasswordFill className="absolute top-3 left-3 text-gray-400" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Potwierdź hasło"
              onChange={handleChange}
              value={data.confirmPassword}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } focus:ring-green-500 dark:bg-gray-700 dark:text-white`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 hover:cursor-pointer text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
        >
          <RiLockPasswordFill className="mr-2" />
          Zarejestruj
        </button>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
          Masz już konto?{" "}
          <NavLink
            to="/login"
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            Zaloguj się
          </NavLink>
        </p>
      </form>
    </div>
  );
}

export default RegisterForm;
