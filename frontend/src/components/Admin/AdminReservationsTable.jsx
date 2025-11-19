import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/*
    Admin reservations table component
*/

export default function AdminReservationsTable() {
  const [reservations, setReservations] = useState([]);
  const [refresh, setRefresh] = useState(false);

  // Fetch reservations and set reservations data
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const reservationsRes = await axios.get(
          "http://localhost:3000/reservation/admin",
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        if (!reservationsRes) console.log("Nie udało się pobrać zamówień");
        setReservations(reservationsRes.data);
      } catch (err) {
        console.log("Błąd przy pobieraniu zamówień: ", err);
      }
    };
    fetchReservations();
  }, [refresh]);

  // Handle reservation delete, show confirm pop-up
  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Czy na pewno chcesz usunąć tę rezerwację?",
      text: "Tej operacji nie można cofnąć",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Tak, usuń!",
      cancelButtonText: "Anuluj",
    });
    if (result.isConfirmed) {
      try {
        const deleted = await axios.delete(
          `http://localhost:3000/reservation/${id}/admin`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        if (!deleted) console.log("Nie udało się usunąć rezerwacji");
        console.log("Usunięto rezerację");
        setRefresh(!refresh);
      } catch (err) {
        console.log("Błąd przy usuwaniu rezerwacji: ", err);
      }
    }
  };

  return (
    <section className="mb-8 p-5">
      <h3 className="text-xl font-semibold mb-2">Rezerwacje</h3>
      <table className="bg-white dark:text-black w-full mb-4 table-auto text-center p-5 border shadow-2xl">
        <thead className="bg-green-950 text-white ">
          <tr>
            <th className="px-2 py-1">Lp.</th>
            <th>Sprzęt</th>
            <th>Użytkownik</th>
            <th>Start</th>
            <th>Koniec</th>
            <th>Miejsce odbioru</th>
            <th>Miejsce zwrotu</th>
            <th>Created At</th>
            <th>-</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-xl p-2 font-bold">
                Brak złożonych rezerwacji
              </td>
            </tr>
          ) : (
            reservations.map((r, i) => (
              <tr key={r._id} className="border-b">
                <td>{i + 1}</td>
                <td>{r.equipmentName}</td>
                <td>{r.userName || r.user}</td>
                <td>
                  {new Date(r.startDate).toLocaleString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                  {", "}
                  {r.startTime}
                </td>
                <td>
                  {new Date(r.endDate).toLocaleString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                  {", "}
                  {r.endTime}
                </td>
                <td>
                  {r.pickupPlace === "store"
                    ? "Sklep"
                    : `${r.deliveryAddressPickup.city}, ul. ${r.deliveryAddressPickup.street} ${r.deliveryAddressPickup.houseNumber}`}
                </td>
                <td>
                  {r.pickupPlace === "store"
                    ? "Sklep"
                    : `${r.deliveryAddressReturn.city}, ul. ${r.deliveryAddressReturn.street} ${r.deliveryAddressReturn.houseNumber}`}
                </td>
                <td>{new Date(r.createdAt).toLocaleString("pl-PL")}</td>
                <td>
                  <button
                    className="rounded m-2 text-white bg-red-600 hover:bg-red-700 hover:cursor-pointer px-2 py-1"
                    onClick={() => handleDelete(r._id)}
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
