import React, { useState} from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/*
    Change password form
    When updated, hide form and refresh page
    When canceled, only hide form
*/

export default function PasswordChangeForm({ onUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const handleChange = ({ currentTarget: input }) => {
    setFormData({ ...formData, [input.name]: input.value });
    if (errors[input.name]) {
      setErrors({ ...errors, [input.name]: "" });
    }
  };

  // Validate password complexity and compare password and confirm
  const validate = () => {
    const errs = {};
    if (!formData.oldPassword) errs.oldPassword = "Wprowadź stare hasło";
    if (!formData.newPassword) errs.newPassword = "Wprowadź nowe hasło";
    else {
      const passwordErrors = [];
      if (formData.newPassword.length < 8) passwordErrors.push("Minimum 8 znaków");
      if (formData.newPassword.length > 30) passwordErrors.push("Maksimum 30 znaków");
      if (!/[a-z]/.test(formData.newPassword))
        passwordErrors.push("Jedna mała litera");
      if (!/[A-Z]/.test(formData.newPassword))
        passwordErrors.push("Jedna duża litera");
      if (!/[0-9]/.test(formData.newPassword)) passwordErrors.push("Jedna cyfra");
      if (!/[^a-zA-Z0-9]/.test(formData.newPassword))
        passwordErrors.push("Jeden znak specjalny");

      if (passwordErrors.length > 0) {
        errs.newPassword = `Hasło musi zawierać: ${passwordErrors.join(
          ", "
        )}`;
      }
    }

    if (formData.newPassword !== formData.confirmPassword) {
      errs.confirmPassword = "Hasła nie są identyczne";
    }
    return errs;
  };

  // Handle submit, show confirm/errors pop-up, including old password not match error, finally hide form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    const editAlert = await MySwal.fire({
      title: "Czy na pewno chcesz zmienić hasło?",
      icon: "question",
      showCancelButton: true,
      cancelButtonColor: "red",
      cancelButtonText: "Anuluj",
      confirmButtonColor: "green",
      confirmButtonText: "Ok",
    });

    if (!editAlert.isConfirmed) return;

    console.log(formData);
    try {
      await axios.put("http://localhost:3000/user/password", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await MySwal.fire("Sukces", "Hasło zostało zmienione", "success");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setErrors("");
      onUpdated();
    } catch (err) {
      MySwal.fire(
        "Błąd",
        err.response?.data?.message || "Coś poszło nie tak",
        "error"
      );
      console.log(err);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Zmiana hasła</h2>

      <div className="mb-3">
        <label className="block mb-1">Stare hasło</label>
        <input
          name="oldPassword"
          type="password"
          value={formData.oldPassword}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.oldPassword ? "border-red-500" : "border-gray-300"
          } focus:ring-green-500 dark:gray-700 `}
        />
        {errors.oldPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>
        )}
      </div>

      <div className="mb-3">
        <label className="block mb-1">Nowe hasło</label>
        <input
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.newPassword ? "border-red-500" : "border-gray-300"
          } focus:ring-green-500 dark:gray-700`}
        />
        {errors.newPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
        )}
      </div>

      <div className="mb-3">
        <label className="block mb-1">Potwierdź nowe hasło</label>
        <input
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.confirmPassword ? "border-red-500" : "border-gray-300"
          } focus:ring-green-500 dark:gray-700`}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="flex justify-between gap-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 hover:cursor-pointer"
        >
          Zapisz zmiany
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 hover:cursor-pointer"
        >
          Anuluj
        </button>
      </div>
    </form>
  );
}
