import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/*
    Admin reviews table
*/

export default function AdminReviewsTable() {
  const [reviews, setReviews] = useState([]);
  const [refresh, setRefresh] = useState(false);

  // Fetch reviews and set review data
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsRes = await axios.get(
          "http://localhost:3000/review/admin",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!reviewsRes) console.log("Nie udało się pobrać recenzji");
        setReviews(reviewsRes.data);
      } catch (err) {
        console.log("Błąd przy pobieraniu recenzji: ", err);
      }
    };
    fetchReviews();
  }, [refresh]);

  // Handle review delete, show confirm pop-up, refresh table after confirm
  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Czy na pewno chcesz usunąć tę recenzję?",
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
          `http://localhost:3000/review/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!deleted) console.log("Nie udało się usunąć recenzji");
        console.log("Usunięto recenzję");
        setRefresh(!refresh);
      } catch (err) {
        console.log("Błąd przy usuwaniu recenzji: ", err);
        MySwal.fire({
          title: "Błąd przy usuwaniu recenzji",
          text: "Błąd: " + (err.response?.data?.message || err.message),
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    }
  };

  return (
    <section className="mb-8 p-5">
      <h3 className="text-xl font-semibold mb-2">Recenzje</h3>
      <table className="bg-white dark:text-black w-full mb-4 table-auto text-center p-5 border-1 shadow-2xl">
        <thead className="bg-green-950 text-white ">
          <tr>
            <th className="px-2 py-1">Lp.</th>
            <th>Imię i nazwisko</th>
            <th>Ocena</th>
            <th>Treść</th>
            <th>Data otrzymania</th>
            <th>-</th>
          </tr>
        </thead>
        <tbody>
          {reviews.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-xl p-2 font-bold">
                Brak recenzji
              </td>
            </tr>
          ) : (
            reviews.map((r, i) => (
              <tr key={r._id} className="border-b">
                <td>{i + 1}</td>
                <td>{r.fullName}</td>
                <td>{r.rating}</td>
                <td>{r.comment}</td>
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
