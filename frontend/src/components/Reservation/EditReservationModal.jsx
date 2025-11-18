import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/*
    Edit reservation modal
    Edit pickup/return date, pickup place and pickup/return address
    User can't change equipment
*/

export default function EditReservationModal({
  reservation,
  onClose,
  onSaved,
}) {

  // Set form data with existing reservation
  const [formData, setFormData] = useState({
    startDate: new Date(reservation.startDate),
    endDate: new Date(reservation.endDate),
    startTime: reservation.startTime || "09:00",
    endTime: reservation.endTime || "17:00",
    pickupPlace: reservation.pickupPlace || "store",
    deliveryAddressPickup: {
      city: reservation.deliveryAddressPickup.city,
      street: reservation.deliveryAddressPickup.street,
      houseNumber: reservation.deliveryAddressPickup.houseNumber || "",
    },
    deliveryAddressReturn: {
      city: reservation.deliveryAddressReturn.city,
      street: reservation.deliveryAddressReturn.street,
      houseNumber: reservation.deliveryAddressReturn.houseNumber || "",
    },
  });
  const [errors, setErrors] = useState({});
  const [excludeIntervals, setExclude] = useState([]);
  const [equipmentData, setEquipmentData] = useState(null);

  // Fetches equipment info and other reservations for the current 
  useEffect(() => {
    const fetch = async () => {
      try {
        const [eqRes, allRes] = await Promise.all([
          axios.get(
            `http://localhost:3000/equipment/${reservation.equipmentId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          axios.get(
            `http://localhost:3000/reservation/equipment/${reservation.equipmentId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
        ]);
        setEquipmentData(eqRes.data);
        setExclude(
          allRes.data
            .filter((r) => r._id !== reservation._id)
            .map((r) => ({
              start: new Date(r.startDate),
              end: new Date(r.endDate),
            }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [reservation]);

  // Handle input change (including nested fields like addresses)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const calculatePrice = () => {
    if (!equipmentData || !formData.startDate || !formData.endDate) return 0;
    const msPerDay = 1000 * 60 * 60 * 24;
    const days =
      Math.ceil((formData.endDate - formData.startDate) / msPerDay) + 1;
    const base = days * equipmentData.pricePerDay;
    const delivery = formData.pickupPlace === "delivery" ? 50 : 0;
    return Number((base + delivery).toFixed(2));
  };

  const validate = () => {
    const e = {};
    const houseNumberRegex = /^[0-9]+[a-zA-Z]?(\/[0-9]+[a-zA-Z]?)?$/;
    if (!formData.startDate || !formData.endDate) e.date = "Wybierz daty";
    if (!formData.startTime) e.startTime = "Godzina odbioru wymagana";
    if (!formData.endTime) e.endTime = "Godzina zwrotu wymagana";
    if (formData.pickupPlace === "delivery") {
      const pickup = formData.deliveryAddressPickup;
      const ret = formData.deliveryAddressReturn;

      if (!pickup?.city || !pickup?.street || !pickup?.houseNumber) {
        e.deliveryAddressPickup = "Proszę wpisać poprawny adres odbioru.";
      } else if (!houseNumberRegex.test(pickup.houseNumber)) {
        e.deliveryAddressPickup = "Nieprawidłowy format numeru domu (odbiór).";
      }

      if (!ret?.city || !ret?.street || !ret?.houseNumber) {
        e.deliveryAddressReturn = "Proszę wpisać poprawny adres zwrotu.";
      } else if (!houseNumberRegex.test(ret.houseNumber)) {
        e.deliveryAddressReturn = "Nieprawidłowy format numeru domu (zwrot).";
      }
    }
    return e;
  };

  // Handle save (validate, show success/error pop-up)
  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const price = calculatePrice();
    try {
      await axios.put(
        `http://localhost:3000/reservation/${reservation._id}`,
        {
          ...formData,
          price,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      await MySwal.fire(
        "Zapisano",
        "Rezerwacja została zaktualizowana",
        "success"
      );
      onSaved();
    } catch (err) {
      console.error(err);
      await MySwal.fire("Błąd", "Nie udało się zapisać zmian", "error");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl bg-white text-black rounded shadow">
      <h3 className="text-xl font-bold mb-4 text-center">Edytuj rezerwację</h3>

      <DatePicker
        selected={formData.startDate}
        onChange={([s, e]) =>
          setFormData((f) => ({ ...f, startDate: s, endDate: e }))
        }
        startDate={formData.startDate}
        endDate={formData.endDate}
        selectsRange
        inline
        minDate={new Date()}
        excludeDateIntervals={excludeIntervals}
      />
      {errors.date && <p className="text-red-500">{errors.date}</p>}

      <div className="flex gap-4 my-4">
        <div className="flex-1">
          <label className="block mb-1">Godzina odbioru</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
          {errors.startTime && (
            <p className="text-red-500">{errors.startTime}</p>
          )}
        </div>
        <div className="flex-1">
          <label className="block mb-1">Godzina zwrotu</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
          {errors.endTime && <p className="text-red-500">{errors.endTime}</p>}
        </div>
      </div>

      <div className="my-4">
        <label className="block mb-1">Miejsce odbioru/zwrotu</label>
        <div className="flex gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="pickupPlace"
              value="store"
              checked={formData.pickupPlace === "store"}
              onChange={handleChange}
            />
            <span className="ml-2">Sklep</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="pickupPlace"
              value="delivery"
              checked={formData.pickupPlace === "delivery"}
              onChange={handleChange}
            />
            <span className="ml-2">Dowóz (+50 zł)</span>
          </label>
        </div>
      </div>

      {formData.pickupPlace === "delivery" && (
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-gray-700">Adres odbioru</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                name="deliveryAddressPickup.city"
                placeholder="Miasto"
                value={formData.deliveryAddressPickup?.city || ""}
                onChange={handleChange}
                className="border rounded px-2 py-1 text-black"
              />
              <input
                type="text"
                placeholder="Ulica"
                name="deliveryAddressPickup.street"
                value={formData.deliveryAddressPickup?.street || ""}
                onChange={handleChange}
                className="border rounded px-2 py-1 text-black"
              />
              <input
                type="text"
                placeholder="Nr domu"
                name="deliveryAddressPickup.houseNumber"
                value={formData.deliveryAddressPickup?.houseNumber || ""}
                onChange={handleChange}
                className="border rounded px-2 py-1 text-black"
              />
            </div>
            {errors.deliveryAddressPickup && (
              <p className="text-red-500">{errors.deliveryAddressPickup}</p>
            )}
            <div>
              <label className="block text-gray-700">Adres zwrotu</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Miasto"
                  name="deliveryAddressReturn.city"
                  value={formData.deliveryAddressReturn?.city || ""}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 text-black"
                />
                <input
                  type="text"
                  placeholder="Ulica"
                  name="deliveryAddressReturn.street"
                  value={formData.deliveryAddressReturn?.street || ""}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 text-black"
                />
                <input
                  type="text"
                  placeholder="Nr domu"
                  name="deliveryAddressReturn.houseNumber"
                  value={formData.deliveryAddressReturn?.houseNumber || ""}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 text-black"
                />
              </div>
              {errors.deliveryAddressReturn && (
                <p className="text-red-500">{errors.deliveryAddressReturn}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 text-lg font-semibold">
        Szacowana cena: {calculatePrice()} zł
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Anuluj
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Zapisz
        </button>
      </div>
    </div>
  );
}
