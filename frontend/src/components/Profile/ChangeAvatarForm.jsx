import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/*
    Change avatar component, refreshes page when updated (props)
    User can upload new profile picture
*/

export default function ChangeAvatarForm({ onUpdated }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  // Handle submit, prevent from page reload, show confirm/error pop-up
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      MySwal.fire({
        title: "Nie wybrano żadnego pliku!",
        icon: "error",
        showCancelButton: false,
        confirmButtonColor: "red",
        confirmButtonText: "Ok",
      });
      return;
    }
    const form = new FormData();
    form.append("avatar", file);
    setUploading(true);
    try {
      const { data } = await axios.put(
        "http://localhost:3000/user/avatar",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      MySwal.fire({
        title: "Pomyślnie zmieniono zdjęcie profilowe!",
        icon: "success",
        showCancelButton: false,
        confirmButtonColor: "green",
        confirmButtonText: "Ok",
      });
      onUpdated();
    } catch (err) {
      MySwal.fire({
        title: "Błąd zmiany awatara!",
        icon: "error",
        showCancelButton: false,
        confirmButtonColor: "red",
        confirmButtonText: "Ok",
      });
      console.error(err);
      return;
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-center my-6">
      <label className="block mb-2 font-medium">Zmień zdjęcie profilowe</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />
      <button
        type="submit"
        disabled={uploading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 hover:cursor-pointer"
      >
        {uploading ? "Wysyłanie…" : "Wyślij"}
      </button>
    </form>
  );
}
