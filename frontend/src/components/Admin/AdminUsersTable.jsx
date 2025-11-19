import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/*
    Admin users table
    Show current users (apart from the admin)
    Delete chosen users
*/

export default function AdminUsersTable() {
  const [users, setUsers] = useState([]);
  const [refresh, setRefresh] = useState(false);

  // Fetch users and set users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userRes = await axios.get("http://localhost:3000/user/admin", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!userRes) console.log("Nie udało się pobrać użytkowników");
        setUsers(userRes.data);
      } catch (err) {
        console.log("Błąd przy pobieraniu użytkowników: ", err);
      }
    };
    fetchUsers();
  }, [refresh]);

  // Handle user delete
  const handleDelete = async (id) => {
    const deleteAlert = await MySwal.fire({
      title: "Czy na pewno chcesz usunąć tego użytkownika?",
      text: "Tej akcji nie można cofnąć",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "green",
      confirmButtonText: "Tak, usuń",
      cancelButtonColor: "red",
      cancelButtonText: "Nie",
    });
    if (!deleteAlert.isConfirmed) {
      return;
    }
    try {
      const deleted = await axios.delete(`http://localhost:3000/user/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!deleted) console.log("Nie udało się usunąć użytkownika");
      console.log("Usunięto użytkownika");
      setRefresh(!refresh);
    } catch (err) {
      console.log("Błąd przy usuwaniu użytkownika: ", err);
      MySwal.fire({
        title: "Błąd przy usuwaniu użytkownika",
        text: "Błąd: " + (err.response?.data?.message || err.message),
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  return (
    <section className="mb-8 p-5">
      <h3 className="text-xl font-semibold mb-2">Użytkownicy</h3>
      <table className="bg-white dark:text-black w-full mb-4 table-auto text-center p-5 border shadow-2xl">
        <thead className="bg-green-950 text-white ">
          <tr>
            <th className="px-2 py-1">Lp.</th>
            <th>FullName</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone number</th>
            <th>Created At</th>
            <th>-</th>
          </tr>
        </thead>
        <tbody>
            {/* Do not show admin users */}
          {users.length === 1 ? (
            <tr>
              <td colSpan="7" className="text-xl p-2 font-bold">
                Brak użytkowników
              </td>
            </tr>
          ) : (
            users
              .filter((u) => u.role !== "admin")
              .map((u, i) => (
                <tr key={u._id} className="border-b">
                  <td>{i + 1}</td>
                  <td>{u.fullName}</td>
                  <td>{u.userName}</td>
                  <td>{u.email}</td>
                  <td>{u.phonenumber}</td>
                  <td>{new Date(u.createdAt).toLocaleString("pl-PL")}</td>
                  <td>
                    <button
                      className="text-white bg-red-600 hover:bg-red-700 hover:cursor-pointer py-1 px-2 rounded m-2"
                      onClick={() => handleDelete(u._id)}
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
