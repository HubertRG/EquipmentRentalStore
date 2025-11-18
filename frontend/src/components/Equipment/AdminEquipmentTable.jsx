import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import EditEquipmentModal from "./EditEquipmentModal";

const MySwal = withReactContent(Swal);

/*
    Admin equipment table component
    Show existing equipment list
    Edit or delete selected
*/

export default function AdminEquipmentTable({ refresh, setRefresh }) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:3000/equipment/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEquipment(data);
    } catch (err) {
      console.error("Błąd pobierania sprzętu:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEquipment();
  }, [refresh]);

  useEffect(() => {
    if (user?.role === "admin") fetchEquipment();
  }, [refresh, user]);

  // Delete selected equipment and refresh table
  const handleDelete = async (id) => {
    const deleteAlert = await MySwal.fire({
      title: "Czy na pewno chcesz usunąć ten sprzęt?",
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
      await axios.delete(`http://localhost:3000/equipment/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRefresh(!refresh);
    } catch (err) {
      console.error("Błąd usuwania sprzętu:", err);
      MySwal.fire({
        title: "Błąd przy usuwaniu sprzętu",
        text: "Błąd: " + (err.response?.data?.message || err.message),
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  // Show editing modal
  const openEdit = (equipment) => {
    setEditing(equipment);
    setShowModal(true);
  };

  // Hide editing modal (cancel edit)
  const closeEdit = () => {
    setShowModal(false);
    setEditing(null);
  };

  // Hide editing modal (saved changes)
  const onSaved = () => {
    setShowModal(false);
    setEditing(!refresh);
    setRefresh(!refresh);
  };

  return user?.role === "admin" ? (
    <div className="flex flex-col flex-wrap items-center">
      <div className="text-black container my-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Zarządzanie sprzętem (admin)</h2>

        {loading ? (
          <p>Ładowanie…</p>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2">Nazwa</th>
                <th className="px-4 py-2">Kategoria</th>
                <th className="px-4 py-2">Cena/dzień</th>
                <th className="px-4 py-2">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.category}</td>
                  <td className="px-4 py-2">{item.pricePerDay} zł</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 hover:cursor-pointer"
                      onClick={() => openEdit(item)}
                    >
                      Edytuj
                    </button>
                    <button
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 hover:cursor-pointer"
                      onClick={() => handleDelete(item._id)}
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Editing modal*/}
        {showModal && editing && (
          <EditEquipmentModal
            equipment={editing}
            onClosed={closeEdit}
            onSaved={onSaved}
          />
        )}
      </div>
    </div>
  ) : null;
}
