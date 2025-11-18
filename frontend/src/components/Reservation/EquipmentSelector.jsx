import React, { useState, useEffect } from "react";
import axios from "axios";

/*
    Equipment selector component used for making reservations
    Sends selected equipment through props to the parent component
*/

function EquipmentSelector({ onSelect, selectedEquipment, refresh }) {
  const [equipment, setEquipment] = useState([]);
  const [filters, setFilters] = useState({
    category: "all",
    availability: "available",
  });

  // Fetch equipment
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/equipment/");
        const withAvailability = await Promise.all(
          data.map(async (item) => {
            const resp = await axios.get(
              `http://localhost:3000/equipment/${item._id}`
            );
            return { ...item, isAvailable: resp.data.isAvailable };
          })
        );
        setEquipment(withAvailability);
      } catch (err) {
        if ((err.response = 401)) {
          window.location.reload();
        }
        console.error("Błąd pobierania sprzętu:", err);
      }
    };
    fetchEquipment();
  }, [refresh]);

  // Filter equipment
  const filteredEquipment = equipment.filter((item) => {
    const categoryMatch =
      filters.category === "all" || item.category === filters.category;
    const availabilityMatch =
      filters.availability === "all" ||
      (filters.availability === "available"
        ? item.isAvailable
        : !item.isAvailable);
    return categoryMatch && availabilityMatch;
  });

  return (
    <div className="text-black space-y-4">
      <div className="flex gap-4 mb-4">
        <select
          className="px-4 py-2 border rounded-lg"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="all">Wszystkie kategorie</option>
          <option value="rowery">Rowery</option>
          <option value="narty">Narty</option>
          <option value="kajaki">Kajaki</option>
        </select>

        <select
          className="px-4 py-2 border rounded-lg"
          value={filters.availability}
          onChange={(e) =>
            setFilters({ ...filters, availability: e.target.value })
          }
        >
          <option value="all">Wszystkie</option>
          <option value="available">Dostępne</option>
          <option value="unavailable">Niedostępne</option>
        </select>
      </div>

      {/* Shows filtered equipment, with current availability
            When clicked, sends selected equipment info to the add reservations component*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEquipment.map((item) => (
          <div
            key={item._id}
            onClick={() => onSelect(item._id)}
            className={`p-4 border rounded-lg cursor-pointer transition-all
              ${selectedEquipment === item._id ? "ring-2 ring-green-500" : ""}
              ${
                item.isAvailable
                  ? "bg-green-50 hover:bg-green-100"
                  : "bg-red-50 hover:bg-red-100 opacity-75"
              }`}
          >
            <div className="space-y-2">
              {item.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded"
                />
              ))}
            </div>
            <h3 className="font-bold">{item.name}</h3>
            <div className="flex justify-between items-center">
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  item.isAvailable
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {item.isAvailable ? "Dostępny" : "Niedostępny"}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Cena: {item.pricePerDay} zł/dzień
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EquipmentSelector;
