import axios from "axios";
import React, { useState, useEffect } from "react";
import EditReservationModal from "./EditReservationModal";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/*
    Reservation list component
    Shows reservations list for current user
    User can delete or edit selected reservations
*/

function ReservationList({ refresh, setRefresh }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch reservations
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get("http://localhost:3000/reservation/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReservations(data);
    } catch (err) {
      if ((err.response = 401)) {
        window.location.reload();
      }
      setError("Nie udało się załadować rezerwacji");
      console.error("Błąd pobierania danych:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  // Handle reservation delete, with confirmation pop-up
  const handleDelete = async (id) => {
    const deleteAlert = await MySwal.fire({
      title: "Czy na pewno chcesz anulować tą rezerwację?",
      text: "Tej akcji nie można cofnąć",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Tak",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
      cancelButtonText: "Nie",
    });
    if (!deleteAlert.isConfirmed) return;
    try {
      await axios.delete(`http://localhost:3000/reservation/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRefresh(!refresh);
    } catch (err) {
      console.error("Błąd usuwania rezerwacji:", err);
    }
  };

  // Show edit modal
  const openEdit = (reservation) => {
    setEditing(reservation);
    setShowModal(true);
  };

  // Hide edit modal (cancel edit)
  const closeEdit = () => {
    setShowModal(false);
    setEditing(null);
  };

  // Hide edit modal (save changes)
  const onSaved = () => {
    setShowModal(false);
    setEditing(null);
    setRefresh(!refresh);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Lista rezerwacji</h2>

      {loading && <p className="text-blue-500">Ładowanie...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Sprzęt</th>
              <th className="py-3 px-4 text-left">Początek rezerwacji</th>
              <th className="py-3 px-4 text-left">Koniec rezerwacji</th>
              <th className="py-3 px-4 text-left">Miejsce odbioru</th>
              <th className="py-3 px-4 text-left">Miejsce zwrotu</th>
              <th className="py-3 px-4 text-left">Cena</th>
              <th className="py-3 px-4 text-left">Akcje</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {reservations.map((item) => (
              <tr
                key={item._id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 px-4">
                  <div className="font-medium">{item.equipmentName}</div>
                  {item.equipmentCategory && (
                    <span className="text-xs text-gray-500">
                      {item.equipmentCategory}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {new Date(item.startDate).toLocaleString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                  {", "}
                  {item.startTime}
                </td>
                <td className="py-3 px-4">
                  {new Date(item.endDate).toLocaleString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                  {", "}
                  {item.endTime}
                </td>
                <td className="py-3 px-4">
                  {item.pickupPlace === "store"
                    ? "Sklep"
                    : `${item.deliveryAddressPickup.city}, ul. ${item.deliveryAddressPickup.street} ${item.deliveryAddressPickup.houseNumber}`}
                </td>
                <td className="py-3 px-4">
                  {item.pickupPlace === "store"
                    ? "Sklep"
                    : `${item.deliveryAddressReturn.city}, ul. ${item.deliveryAddressReturn.street} ${item.deliveryAddressReturn.houseNumber}`}
                </td>
                <td className="py-3 px-4">{item.price} zł</td>
                <td className="py-3 px-4 space-x-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="bg-yellow-500 hover:bg-yellow-600 hover:cursor-pointer text-white py-1 px-3 rounded text-sm"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="bg-red-500 hover:bg-red-600 hover:cursor-pointer text-white py-1 px-3 rounded text-sm"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={fetchData}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Odśwież listę
        </button>

        <div className="text-sm text-gray-500">
          Liczba rezerwacji: {reservations.length}
        </div>
      </div>

      {/* Edit modal */}
      {showModal && editing && (
        <EditReservationModal
          reservation={editing}
          onClose={closeEdit}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

export default ReservationList;
