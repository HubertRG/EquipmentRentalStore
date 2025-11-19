import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/*
    Contact form component
*/

export default function ContactForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    subject: "",
    content: "",
  });
  const [errors, setErrors] = useState("");
  // Validate data (fullName, email, subject and message content)
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.fullName.trim()) {
      newErrors.fullName = "Imię i nazwisko są wymagane";
    } else if (form.fullName.length < 3 || form.fullName.length > 30) {
      newErrors.fullName = "Imię i nazwisko muszą zawierać 3-30 znaków";
    }
    if (!form.email.trim()) {
      newErrors.email = "Adres email jest wymagany";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Należy podać poprawny adres email";
    }
    if (!form.subject.trim()) {
      newErrors.subject = "Temat wiadomości jest wymagany";
    } else if (form.subject.length < 3 || form.subject.length > 30) {
      newErrors.subject = "Temat wiadomości musi zawierać 3-30 znaków";
    }
    if (!form.content.trim()) {
      newErrors.content = "Treść wiadomości jest wymagana";
    } else if (form.content.length < 10 || form.content.length > 150) {
      newErrors.content = "Treść wiadomości musi zawierać 10-150 znaków";
    }
    return newErrors;
  };
  const handleChange = ({ currentTarget: input }) => {
    setForm({ ...form, [input.name]: input.value });
    if (errors[input.name]) {
      setErrors((prev) => ({ ...prev, [input.name]: "" }));
    }
  };
  // Handle submit, prevent page refresh, show success pop-up
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      await axios.post("http://localhost:3000/message/", form);
      console.log("Wysłano wiadomość");
      MySwal.fire(
        "Dziękujęmy",
        "Wiadomość została wysłana! Dalszy kontakt będzie odbywał się przy pomocy podanego adresu email",
        "success"
      );
      setErrors({});
      setForm({ fullName: "", email: "", subject: "", content: "" });
    } catch (err) {
      console.log("Błąd przy wysyłaniu wiadomości: ", err);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white dark:bg-green-950 p-8 rounded-lg shadow"
    >
      <div className="mb-4 text-2xl font-semibold text-center">
        <h2>Formularz kontaktowy</h2>
      </div>
      <div className="mb-4">
        <label className="block mb-1">Imię i nazwisko</label>
        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.fullName ? "border-red-500" : "border-gray-300"
          } focus:ring-green-500 dark:bg-gray-700 dark:text-white`}
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.email ? "border-red-500" : "border-gray-300"
          } focus:ring-green-500 dark:bg-gray-700 dark:text-white`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1">Temat</label>
        <input
          type="text"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.subject ? "border-red-500" : "border-gray-300"
          } focus:ring-green-500 dark:bg-gray-700 dark:text-white`}
        />
        {errors.subject && (
          <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1">Wiadomość</label>
        <textarea
          value={form.content}
          name="content"
          onChange={handleChange}
          rows="6"
          className={`w-full px-3 py-2 border rounded ${
            errors.content ? "border-red-500" : "border-gray-300"
          } focus:ring-green-500 dark:bg-gray-700 dark:text-white`}
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content}</p>
        )}
      </div>
      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
      >
        Wyślij
      </button>
    </form>
  );
}
