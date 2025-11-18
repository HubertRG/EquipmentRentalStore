import React, { useState, useEffect } from "react";
import axios from "axios";

/*
    Equipment list component
    Shows equipment info with images
    User can filter equipment 
*/

function EquipmentList({ refresh}) {
  const [equipment, setEquipment] = useState([]);
  const [filters, setFilters] = useState({
    category: "all",
    availability: "all",
    searchQuery: "",
    minPrice: "",
    maxPrice: "",
  });

  // Fetch equipment with availability
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
        console.error("Błąd pobierania sprzętu:", err);
      }
    };
    fetchEquipment();
  }, [refresh]);

  // Filter equipment
  const filteredEquipment = equipment.filter((item) => {
    const matchesCategory =
      filters.category === "all" || item.category === filters.category;
    const matchesAvailability =
      filters.availability === "all" ||
      (filters.availability === "available"
        ? item.isAvailable
        : !item.isAvailable);
    const matchesSearch = item.name
      .toLowerCase()
      .includes(filters.searchQuery.toLowerCase());
    const matchesPrice =
      (!filters.minPrice || item.pricePerDay >= Number(filters.minPrice)) &&
      (!filters.maxPrice || item.pricePerDay <= Number(filters.maxPrice));

    return (
      matchesCategory && matchesAvailability && matchesSearch && matchesPrice
    );
  });

  // Equipment categories set
  const categories = [...new Set(equipment.map((item) => item.category))];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Reset filters button
  const resetFilters = () => {
    setFilters({
      category: "all",
      availability: "all",
      searchQuery: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  return (
    <div className="flex flex-col flex-wrap items-center">
      <div className="text-black container my-5 p-3 border rounded-xl bg-white dark:bg-green-950 transition-colors duration-300">
        <h2 className="text-center text-xl font-bold mb-3 text-black dark:text-white">
          Katalog sprzętu
        </h2>

        <div className="mb-6 p-4 bg-slate-100 rounded-lg shadow-sm border-1">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Szukaj po nazwie..."
              className="p-2 border rounded"
              name="searchQuery"
              value={filters.searchQuery}
              onChange={handleFilterChange}
            />

            <select
              className="p-2 border rounded"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="all">Wszystkie kategorie</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              className="p-2 border rounded"
              name="availability"
              value={filters.availability}
              onChange={handleFilterChange}
            >
              <option value="all">Wszystkie</option>
              <option value="available">Dostępne</option>
              <option value="unavailable">Niedostępne</option>
            </select>

            <input
              type="number"
              placeholder="Min. cena"
              className="p-2 border rounded"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />

            <input
              type="number"
              placeholder="Max. cena"
              className="p-2 border rounded"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Wyczyść filtry
            </button>
            <span className="text-sm text-gray-600">
              Znaleziono: {filteredEquipment.length} pozycji
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((item) => (
            <div
              key={item._id}
              className="p-4 border rounded-lg bg-slate-100 text-black hover:shadow-lg transition-shadow"
            >
              <div className="space-y-2">
                {item.images?.length > 0 ? (
                  item.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded"
                    />
                  ))
                ) : (
                  <div className="w-full h-48 bg-white rounded flex items-center justify-center">
                    <span className="text-gray-400">Brak zdjęcia</span>
                  </div>
                )}
              </div>
              <h3 className="font-bold mt-2">{item.name}</h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm">
                  <span className="font-semibold">Kategoria:</span>{" "}
                  {item.category}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Cena:</span>{" "}
                  {item.pricePerDay} zł/dzień
                </p>
                <p className="text-sm">{item.description}</p>
                <p className="text-sm">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 
                  ${item.isAvailable ? "bg-green-500" : "bg-red-500"}`}
                  />
                  {item.isAvailable ? "Dostępny" : "Niedostępny"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-6 text-white">
            Brak sprzętu spełniającego kryteria wyszukiwania
          </div>
        )}
      </div>
    </div>
  );
}

export default EquipmentList;
