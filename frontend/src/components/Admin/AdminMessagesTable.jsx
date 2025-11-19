import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/*
    Admin messages table component
*/

export default function AdminMessagesTable() {
  const [messages, setMessages] = useState([]);
  const [refresh, setRefresh] = useState(false);

  // Fetch messages and set messages data
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messagesRes = await axios.get("http://localhost:3000/message/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!messagesRes) console.log("Nie udało się pobrać wiadomości");
        setMessages(messagesRes.data);
      } catch (err) {
        console.log("Błąd przy pobieraniu wiadomości: ", err);
      }
    };
    fetchMessages();
  }, [refresh]);

  // Handle message delete, show confirm pop-up, refresh table when confirmed
  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Czy na pewno chcesz usunąć tę wiadomość?",
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
          `http://localhost:3000/message/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!deleted) console.log("Nie udało się usunąć wiadomości");
        console.log("Usunięto wiadomość");
        setRefresh(!refresh);
      } catch (err) {
        console.log("Błąd przy usuwaniu wiadomości: ", err);
        MySwal.fire({
          title: "Błąd przy usuwaniu wiadomości",
          text: "Błąd: " + (err.response?.data?.message || err.message),
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    }
  };

  return (
    <section className="mb-8 p-5">
      <h3 className="text-xl font-semibold mb-2">Wiadomości</h3>
      <table className="bg-white dark:text-black w-full mb-4 table-auto text-center p-5 border shadow-2xl">
        <thead className="bg-green-950 text-white ">
          <tr>
            <th className="px-2 py-1">Lp.</th>
            <th>Imię i nazwisko</th>
            <th>Adres email</th>
            <th>Temat</th>
            <th>Treść</th>
            <th>Data otrzymania</th>
            <th>-</th>
          </tr>
        </thead>
        <tbody>
          {messages.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-xl p-2 font-bold">
                Brak wysłanych wiadomości
              </td>
            </tr>
          ) : (
            messages.map((m, i) => (
              <tr key={m._id} className="border-b">
                <td>{i + 1}</td>
                <td>{m.fullName}</td>
                <td>{m.email}</td>
                <td>{m.subject}</td>
                <td>{m.content}</td>
                <td>{new Date(m.sentAt).toLocaleString("pl-PL")}</td>
                <td>
                  <button
                    className="rounded m-2 text-white bg-red-600 hover:bg-red-700 hover:cursor-pointer px-2 py-1"
                    onClick={() => handleDelete(m._id)}
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
