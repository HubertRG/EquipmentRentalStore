import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/*
    Equipment editing modal component
    Edit equipment info, manage images (delete old and upload new ones)
*/

export default function EditEquipmentModal({ equipment, onClosed, onSaved }) {
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    pricePerDay: "",
  });
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const categories = ["rowery", "narty", "kajaki", "inne"];

  // Fetch equipment info with images
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3000/equipment/${equipment._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setForm({
          name: data.name,
          category: data.category,
          description: data.description,
          pricePerDay: data.pricePerDay,
        });
        setImages(data.images || []);
      } catch (err) {
        console.log("Błąd pobierania sprzętu: ", err);
        MySwal.fire("Błąd", "Nie udało się pobrać sprzętu" + err, "error");
      }
    };
    fetchEquipment();
  }, [equipment]);

  // Validate data on input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validate data
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "Nazwa sprzętu jest wymagana!";
    } else if (form.name.length < 3 || form.name.length > 30) {
      newErrors.name = "Nazwa sprzętu musi mieć 3-30 znaków";
    }
    if (!form.description.trim()) {
      newErrors.description = "Opis sprzętu jest wymagany!";
    } else if (form.description.length < 3 || form.description.length > 50) {
      newErrors.description = "Opis sprzętu musi mieć 3-50 znaków";
    }
    if (isNaN(form.pricePerDay) || Number(form.pricePerDay) <= 0) {
      newErrors.pricePerDay = "Cena musi być dodatnią liczbą";
    }
    return newErrors;
  };

  // Handle images change
  const handleFileChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const confirm = await MySwal.fire({
      title: "Zatwierdzić zmiany?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Tak, zapisz",
      cancelButtonText: "Anuluj",
    });
    if (!confirm.isConfirmed) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("pricePerDay", form.pricePerDay);
      removedImages.forEach((url) => formData.append("removedImages", url));
      newImages.forEach((file) => formData.append("images", file));

      const res = await axios.put(
        `http://localhost:3000/equipment/${equipment._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      MySwal.fire("Sukces", "Sprzęt został zaktualizowany", "success");
      onSaved();
    } catch (err) {
      console.log("Błąd edycji sprzętu: ", err);
      MySwal.fire("Błąd", "Błąd przy zapisie: " + err, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Edytuj sprzęt</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-medium">Nazwa*</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${
                errors.name ? "border-red-500" : "border-gray-300"
              } focus:ring-green-500 dark:gray-700`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block font-medium">Kategoria</label>
            <select
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium">Opis</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${
                errors.description ? "border-red-500" : "border-gray-300"
              } focus:ring-green-500 dark:gray-700`}
              rows={4}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
          <div>
            <label className="block font-medium">Cena za dzień (PLN)*</label>
            <input
              type="number"
              name="pricePerDay"
              value={form.pricePerDay}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${
                errors.pricePerDay ? "border-red-500" : "border-gray-300"
              } focus:ring-green-500 dark:gray-700`}
              min="0"
              step="0.01"
            />
            {errors.pricePerDay && (
              <p className="text-red-500 text-sm mt-1">{errors.pricePerDay}</p>
            )}
          </div>

          {/* Edit existing images */}
          <div>
            <label className="block font-medium">Obecne zdjęcia</label>
            <div className="flex flex-wrap gap-2">
              {images.map((url) => {
                const isRemoved = removedImages.includes(url);
                return (
                  <div key={url} className="relative">
                    <img
                      src={url}
                      alt="sprzęt"
                      className={`w-24 h-24 object-cover rounded ${
                        isRemoved ? "opacity-30" : ""
                      }`}
                    />
                    <label className="absolute top-1 right-1">
                      <input
                        type="checkbox"
                        checked={isRemoved}
                        onChange={() => {
                          setRemovedImages((prev) =>
                            prev.includes(url)
                              ? prev.filter((u) => u !== url)
                              : [...prev, url]
                          );
                        }}
                      />
                      <span className="ml-1 text-xs text-white bg-red-600 rounded px-1">
                        Usuń
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add new images */}
          <div>
            <label className="block font-medium">
              Nowe zdjęcia (opcjonalnie)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClosed}
              className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Zapisz zmiany
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
