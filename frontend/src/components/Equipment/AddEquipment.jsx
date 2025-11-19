import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/*
    Add equipment component (admin only)
    Upload images (with drag and drop support)
*/

function AddEquipment({ refresh, setRefresh }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "inne",
    pricePerDay: "",
    images: [],
  });

  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = ({ currentTarget: input }) => {
    setFormData({ ...formData, [input.name]: input.value });
    if (errors[input.name]) {
      setErrors((prev) => ({ ...prev, [input.name]: "" }));
    }
  };

  const categories = ["rowery", "narty", "kajaki", "inne"];

  // On drop action config (add dropped image to the images array)
  const onDrop = useCallback((acceptedFiles) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...acceptedFiles],
    }));
  }, []);

  // Dropzone config (drop action, accepted files, maximum size)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 5 * 1024 * 1024,
  });

  // Remove images from the upload array
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Validate form data
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Nazwa sprzętu jest wymagana!";
    } else if (formData.name.length < 3 || formData.name.length > 30) {
      newErrors.name = "Nazwa sprzętu musi mieć 3-30 znaków";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Opis sprzętu jest wymagany!";
    } else if (
      formData.description.length < 3 ||
      formData.description.length > 50
    ) {
      newErrors.description = "Opis sprzętu musi mieć 3-50 znaków";
    }
    if (isNaN(formData.pricePerDay) || Number(formData.pricePerDay) <= 0) {
      newErrors.pricePerDay = "Cena musi być dodatnią liczbą";
    }
    return newErrors;
  };

  // If validation successful, send data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("pricePerDay", formData.pricePerDay);

      formData.images.forEach((image, index) => {
        formDataToSend.append(`images`, image);
      });

      const response = await axios.post(
        "http://localhost:3000/equipment/",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setErrors({});
      setFormData({
        name: "",
        description: "",
        category: "inne",
        pricePerDay: "",
        images: [],
      });
      setRefresh(!refresh);
      MySwal.fire({
        text: "Sprzęt dodano pomyślnie",
        icon: "success",
        confirmButtonText: "Ok",
      });
    } catch (err) {
      MySwal.fire({
        title: "Błąd przy dodawaniu sprzętu",
        text: "Błąd: " + (err.response?.data?.message || err.message),
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 max-w-md bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Dodaj nowy sprzęt
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Nazwa sprzętu</label>
          <input
            type="text"
            name="name"
            className={`w-full px-4 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            onChange={handleChange}
            value={formData.name}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Opis</label>
          <textarea
          name="description"
            className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            rows="3"
            value={formData.description}
            onChange={handleChange}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Kategoria</label>
          <select
          name="category"
            className="w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.category}
            onChange={handleChange}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">
            Cena za dzień (PLN)
          </label>
          <input
            type="number"
            name="pricePerDay"
            step="0.01"
            min="0"
            className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.pricePerDay ? "border-red-500" : "border-gray-300"
            }`}
            value={formData.pricePerDay}
            onChange={handleChange}
          />
          {errors.pricePerDay && (
            <p className="text-red-500 text-sm mt-1">{errors.pricePerDay}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Zdjęcia</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
              ${
                isDragActive
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300"
              }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Upuść zdjęcia tutaj...</p>
            ) : (
              <p>Przeciągnij i upuść zdjęcia, lub kliknij aby wybrać</p>
            )}
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2">
            {formData.images.map((file, index) => (
              <div key={file.name} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Podgląd"
                  className="h-24 w-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200
            ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {uploading ? "Dodawanie..." : "Dodaj sprzęt"}
        </button>
      </form>
    </div>
  );
}

export default AddEquipment;
