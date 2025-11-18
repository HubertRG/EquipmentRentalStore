import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import EquipmentSelector from "./EquipmentSelector";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/*
    Add reservation component
    Uses react datepicker to pick reservation dates
    Uses separate component to select equipment
*/

function AddReservation({ refresh, setRefresh }) {
  const { user } = useAuth();

  // Holds fetched reservations for the selected equipment.
  const [reservations, setReservations] = useState([]);
  const [errors, setErrors] = useState("");
  // Stores additional information about selected equipment
  const [selectedEquipmentData, setSelectedEquipmentData] = useState(null);
  const [formData, setFormData] = useState({
    equipment: null,
    startDate: null,
    endDate: null,
    startTime: "",
    endTime: "",
    pickupPlace: "",
    deliveryAddressPickup: {
      city: "",
      street: "",
      houseNumber: "",
    },
    deliveryAddressReturn: {
      city: "",
      street: "",
      houseNumber: "",
    },
    price: "",
  });

  /* Whenever selected equipment changes, fetch all reservations for it
    and also load equipment details (used for price calculation).
    If no equipment is selected, reset the dependent state. */
  useEffect(() => {
    if (!formData.equipment) {
      setReservations([]);
      setSelectedEquipmentData(null);
      return;
    }
    const fetchData = async () => {
      try {
        const [resData, eqData] = await Promise.all([
          axios.get(
            `http://localhost:3000/reservation/equipment/${formData.equipment}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          axios.get(`http://localhost:3000/equipment/${formData.equipment}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);
        setReservations(resData.data);
        setSelectedEquipmentData(eqData.data);
      } catch (err) {
        console.error("Błąd pobierania danych:", err);
      }
    };

    fetchData();
    setFormData((prev) => ({
      ...prev,
      startDate: null,
      endDate: null,
    }));
  }, [formData.equipment]);

  /* Converts existing reservations into a list of date intervals
  that the DatePicker will block to prevent overlapping reservations. */
  const excludeIntervals = useMemo(
    () =>
      reservations.map((r) => ({
        start: new Date(r.startDate),
        end: new Date(r.endDate),
      })),
    [reservations]
  );

  const handleChange = ({ currentTarget: input }) => {
    setFormData((prev) => ({
      ...prev,
      [input.name]: input.value,
    }));

    if (errors[input.name]) {
      setErrors((prev) => ({
        ...prev,
        [input.name]: "",
      }));
    }
  };

  /* Calculates the final reservation price based on:
    - number of reserved days,
    - equipment daily price,
    - optional delivery fee.
    Returns the price rounded to 2 decimals. */
  const calculatePrice = () => {
    if (!formData.startDate || !formData.endDate || !selectedEquipmentData)
      return 0;
    const msPerDay = 1000 * 60 * 60 * 24;
    const days =
      Math.ceil((formData.endDate - formData.startDate) / msPerDay) + 1;
    const base = days * selectedEquipmentData.pricePerDay;
    const delivery = formData.pickupPlace === "delivery" ? 50 : 0;
    return Number((base + delivery).toFixed(2));
  };

  // Validate data
  const validate = () => {
    const newErrors = {};
    const houseNumberRegex = /^[0-9]+[a-zA-Z]?(\/[0-9]+[a-zA-Z]?)?$/;
    if (!formData.equipment) {
      newErrors.equipment = "Wybierz sprzęt!";
    }
    if (!formData.startDate || !formData.endDate) {
      newErrors.date = "Wybierz zakres dat!";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Wybierz godzinę odbioru";
    }
    if (!formData.endTime) {
      newErrors.endTime = "Wybierz godzinę zwrotu";
    }
    if (!formData.pickupPlace) {
      newErrors.pickupPlace = "Proszę wybrać sposób odbioru sprzętu";
    }
    if (formData.pickupPlace === "delivery") {
      const pickup = formData.deliveryAddressPickup;
      const ret = formData.deliveryAddressReturn;

      if (!pickup?.city || !pickup?.street || !pickup?.houseNumber) {
        newErrors.deliveryAddressPickup =
          "Proszę wpisać poprawny adres odbioru.";
      } else if (!houseNumberRegex.test(pickup.houseNumber)) {
        newErrors.deliveryAddressPickup =
          "Nieprawidłowy format numeru domu (odbiór).";
      }

      if (!ret?.city || !ret?.street || !ret?.houseNumber) {
        newErrors.deliveryAddressReturn =
          "Proszę wpisać poprawny adres zwrotu.";
      } else if (!houseNumberRegex.test(ret.houseNumber)) {
        newErrors.deliveryAddressReturn =
          "Nieprawidłowy format numeru domu (zwrot).";
      }
    }
    return newErrors;
  };

  /* Handle submit, validate data, calculate price
  When user selects store pickup/delivery, put store's address as the pickup/delivery address */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const calculatedPrice = calculatePrice();

    let submissionData = {};

    if (formData.pickupPlace === "store") {
      submissionData = {
        ...formData,
        deliveryAddressPickup: {
          city: "Lublin",
          street: "Nadbystrzycka",
          houseNumber: "38",
        },
        deliveryAddressReturn: {
          city: "Lublin",
          street: "Nadbystrzycka",
          houseNumber: "38",
        },
        price: calculatedPrice,
      };
    } else {
      submissionData = {
        ...formData,
        price: calculatedPrice,
      };
    }

    try {
      await axios.post(
        "http://localhost:3000/reservation/",
        {
          equipment: submissionData.equipment,
          startDate: submissionData.startDate,
          endDate: submissionData.endDate,
          startTime: submissionData.startTime,
          endTime: submissionData.endTime,
          pickupPlace: submissionData.pickupPlace,
          deliveryAddressPickup: submissionData.deliveryAddressPickup,
          deliveryAddressReturn: submissionData.deliveryAddressReturn,
          price: submissionData.price,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setRefresh(!refresh);
      await MySwal.fire({
        title: "Pomyślnie złożono rezerwację",
        text: "Szczegóły prześlemy mailowo",
        icon: "success",
        confirmButtonColor: "#00ff00",
      });

      setFormData({
        equipment: null,
        startDate: null,
        endDate: null,
        startTime: "",
        endTime: "",
        pickupPlace: "store",
        deliveryAddressPickup: {
          city: "",
          street: "",
          houseNumber: "",
        },
        deliveryAddressReturn: {
          city: "",
          street: "",
          houseNumber: "",
        },
        price: "",
      });
    } catch (err) {
      console.log(err);
      await MySwal.fire({
        title: "Błąd przy składaniu rezerwacji",
        text: err.response?.data?.message || err.message,
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 max-w-2xl bg-white rounded-lg shadow-md">
      <h2 className="text-center text-2xl font-bold mb-6 text-gray-800">
        Nowa rezerwacja
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <EquipmentSelector
          onSelect={(equipmentId) =>
            setFormData({
              equipment: equipmentId,
              startDate: null,
              endDate: null,
            })
          }
          selectedEquipment={formData.equipment}
          refresh={refresh}
        />
        {!formData.equipment && (
          <h2 className="text-red-500 font-semibold mt-1">
            {errors.equipment}
          </h2>
        )}

        {formData.equipment && (
          <div className="mt-4">
            <h3 className="font-bold mb-2 text-gray-800">Wybierz zakres dat</h3>
            <DatePicker
              selected={formData.startDate}
              onChange={(dates) => {
                const [start, end] = dates;
                setFormData((prev) => ({
                  ...prev,
                  startDate: start,
                  endDate: end,
                }));
              }}
              startDate={formData.startDate}
              endDate={formData.endDate}
              selectsRange
              inline
              minDate={new Date()}
              excludeDateIntervals={excludeIntervals}
            />
            {formData.startDate && formData.endDate ? (
              <p className="mt-2 text-gray-700">
                Wybrano: {formData.startDate.toLocaleDateString()} -{" "}
                {formData.endDate.toLocaleDateString()}
              </p>
            ) : (
              <p className="text-red-500 font-semibold m-1">{errors.date}</p>
            )}
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <label className="block text-gray-700">Godzina odbioru</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1 text-black"
                />
                {errors.startTime && (
                  <p className="text-red-500 font-semibold mt-5">
                    {errors.startTime}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-gray-700">Godzina zwrotu</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1 text-black"
                />
                {errors.endTime && (
                  <p className="text-red-500 font-semibold mt-5">
                    {errors.endTime}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 mb-1">
                Miejsce odbioru/zwrotu
              </label>
              <div className="flex gap-4">
                <label className="inline-flex items-center text-black">
                  <input
                    type="radio"
                    name="pickupPlace"
                    value="store"
                    checked={formData.pickupPlace === "store"}
                    onChange={handleChange}
                    className="form-radio"
                  />
                  <span className="ml-2">Odbiór w sklepie</span>
                </label>
                <label className="inline-flex items-center text-black">
                  <input
                    type="radio"
                    name="pickupPlace"
                    value="delivery"
                    checked={formData.pickupPlace === "delivery"}
                    onChange={handleChange}
                    className="form-radio"
                  />
                  <span className="ml-2">Dowóz (+50 zł)</span>
                </label>
              </div>
            </div>
            {errors.pickupPlace && (
              <p className="text-red-500 font-semibold mt-5">
                {errors.pickupPlace}
              </p>
            )}

            {formData.pickupPlace === "delivery" && (
              <div className="space-y-2">
                <div>
                  <label className="block text-gray-700">Adres odbioru</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Miasto"
                      value={formData.deliveryAddressPickup?.city || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          deliveryAddressPickup: {
                            ...prev.deliveryAddressPickup,
                            city: e.target.value,
                          },
                        }))
                      }
                      className="border rounded px-2 py-1 text-black"
                    />
                    <input
                      type="text"
                      placeholder="Ulica"
                      value={formData.deliveryAddressPickup?.street || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          deliveryAddressPickup: {
                            ...prev.deliveryAddressPickup,
                            street: e.target.value,
                          },
                        }))
                      }
                      className="border rounded px-2 py-1 text-black"
                    />
                    <input
                      type="text"
                      placeholder="Nr domu"
                      value={formData.deliveryAddressPickup?.houseNumber || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          deliveryAddressPickup: {
                            ...prev.deliveryAddressPickup,
                            houseNumber: e.target.value,
                          },
                        }))
                      }
                      className="border rounded px-2 py-1 text-black"
                    />
                  </div>
                  {errors.deliveryAddressPickup && (
                    <p className="text-red-500 text-sm">
                      {errors.deliveryAddressPickup}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700">Adres zwrotu</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Miasto"
                      value={formData.deliveryAddressReturn?.city || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          deliveryAddressReturn: {
                            ...prev.deliveryAddressReturn,
                            city: e.target.value,
                          },
                        }))
                      }
                      className="border rounded px-2 py-1 text-black"
                    />
                    <input
                      type="text"
                      placeholder="Ulica"
                      value={formData.deliveryAddressReturn?.street || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          deliveryAddressReturn: {
                            ...prev.deliveryAddressReturn,
                            street: e.target.value,
                          },
                        }))
                      }
                      className="border rounded px-2 py-1 text-black"
                    />
                    <input
                      type="text"
                      placeholder="Nr domu"
                      value={formData.deliveryAddressReturn?.houseNumber || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          deliveryAddressReturn: {
                            ...prev.deliveryAddressReturn,
                            houseNumber: e.target.value,
                          },
                        }))
                      }
                      className="border rounded px-2 py-1 text-black"
                    />
                  </div>
                  {errors.deliveryAddressReturn && (
                    <p className="text-red-500 text-sm">
                      {errors.deliveryAddressReturn}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 text-lg font-semibold text-gray-800">
              Szacowana cena: {calculatePrice()} zł
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold mb-2 text-gray-800">
                Istniejące rezerwacje
              </h3>
              {reservations.length > 0 ? (
                <ul className="list-disc ml-5 text-gray-700">
                  {reservations.map((r, idx) => (
                    <li key={idx}>
                      {new Date(r.startDate).toLocaleDateString()} -{" "}
                      {new Date(r.endDate).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600">
                  Brak rezerwacji dla tego sprzętu
                </p>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 hover:cursor-pointer text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          Dodaj rezerwację
        </button>
      </form>
    </div>
  );
}

export default AddReservation;
