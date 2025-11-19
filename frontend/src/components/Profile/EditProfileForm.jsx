import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/*
    Edit profile form component
    When updated hide form and refresh page
    When canceled only hide form
*/

export default function EditProfileForm({ profile, onUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    phonenumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Set form data with current profile info
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        userName: profile.userName || "",
        email: profile.email || "",
        phonenumber: profile.phonenumber ? String(profile.phonenumber) : "",
      });
    }
  }, [profile]);

  // Handle input change
  const handleChange = ({ currentTarget: input }) => {
    setFormData({ ...formData, [input.name]: input.value });
    if (errors[input.name]) {
      setErrors({ ...errors, [input.name]: "" });
    }
  };

  // Validate form (email, phonenumber and username regex)
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{9}$/;
    const usernameRegex = /^[a-zA-Z0-9]+$/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Pełne imię jest wymagane";
    } else if (formData.fullName.length < 3 || formData.fullName.length > 50) {
      newErrors.fullName = "Imię musi mieć 3-50 znaków";
    }

    if (!formData.userName.trim()) {
      newErrors.userName = "Nazwa użytkownika jest wymagana";
    } else if (formData.userName.length < 3 || formData.userName.length > 30) {
      newErrors.userName = "Nazwa musi mieć 3-30 znaków";
    } else if (!usernameRegex.test(formData.userName)) {
      newErrors.userName = "Tylko litery i cyfry są dozwolone";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email jest wymagany";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Nieprawidłowy format email";
    }

    if (!formData.phonenumber.trim()) {
      newErrors.phonenumber = "Numer telefonu jest wymagany";
    } else if (!phoneRegex.test(formData.phonenumber)) {
      newErrors.phonenumber = "Numer musi mieć 9 cyfr";
    }

    return newErrors;
  };

  // Handle submit, prevent page reload, validate data, show confirm/error pop-up, finally hide form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const editAlert = await MySwal.fire({
      title: "Czy na pewno chcesz zmienić dane profilowe?",
      icon: "question",
      showCancelButton: true,
      cancelButtonColor: "red",
      cancelButtonText: "Anuluj",
      confirmButtonColor: "green",
      confirmButtonText: "Ok",
    });

    if (!editAlert.isConfirmed) return;

    setSaving(true);
    try {
      const { data: updatedUser } = await axios.put(
        "http://localhost:3000/user/",
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      onUpdated();
    } catch (err) {
      MySwal.fire({
        title: "Błąd",
        text: "Nie udało się zaktualizować profilu",
        icon: "error",
      });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Edytuj profil</h2>

      <div className="mb-3">
        <label className="block mb-1">Imię i nazwisko</label>
        <input
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.fullName ? "border-red-500" : "border-gray-300"
          } focus:ring-green-500 dark:gray-700 `}
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
        )}
      </div>

      <div className="mb-3">
        <label className="block mb-1">Nazwa użytkownika</label>
        <input
          name="userName"
          type="text"
          value={formData.userName}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.userName ? "border-red-500" : "border-gray-300"
          } focus:ring-green-500 dark:gray-700`}
        />
        {errors.userName && (
          <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
        )}
      </div>

      <div className="mb-3">
        <label className="block mb-1">Adres email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.email ? "border-red-500" : "border-gray-300"
          } focus:ring-green-500 dark:gray-700`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div className="mb-3">
        <label className="block mb-1">Numer telefonu</label>
        <input
          name="phonenumber"
          type="text"
          value={formData.phonenumber}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded focus:ring-2 ${
            errors.phonenumber ? "border-red-500" : "border-gray-300"
          } focus:ring-green-500 dark:gray-700`}
        />
        {errors.phonenumber && (
          <p className="text-red-500 text-sm mt-1">{errors.phonenumber}</p>
        )}
      </div>

      <div className="flex justify-between gap-4">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 hover:cursor-pointer"
        >
          {saving ? "Zapis…" : "Zapisz zmiany"}
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
