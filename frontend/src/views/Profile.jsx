import React, { useState, useEffect } from "react";
import Navbar from "../components/Universal/Navbar";
import Footer from "../components/Universal/Footer";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ChangeAvatarForm from "../components/Profile/ChangeAvatarForm";

const MySwal = withReactContent(Swal);

/*
    User profile page
    User can change profile picture and data (email, full name and username)
    User can also change password and delete account
*/

export default function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({});
  const [refresh, setRefresh] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch profile info
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(data);
      } catch (err) {
        console.log("Błąd przy pobieraniu profilu");
      }
    };
    fetchProfile();
  }, [refresh, token]);

  const navigate = useNavigate();

  // Handle user delete, show confirm, remove token and user from localStorage, redirect to login
  const handleDelete = async () => {
    const deleteAlert = await MySwal.fire({
      title: "Czy na pewno chcesz usunąć konto?",
      text: "Tej akcji nie można cofnąć. Razem z kontem zostaną usunięte wszystkie złożone rezerwacje",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Tak, usuń",
      cancelButtonText: "Anuluj",
    });
    if (!deleteAlert.isConfirmed) {
      return;
    }
    try {
      await axios.delete("http://localhost:3000/user/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      logout();
      console.log("Usunięto użytkownika");
      navigate("/login");
    } catch (err) {
      console.log("Błąd przy usuwaniu konta: ", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-[#242424] p-4 transition-colors duration-300">
        <h1 className="text-3xl text-black dark:text-white font-bold mb-6">
          Mój profil
        </h1>
        <div className="flex flex-wrap w-full gap-8 text-black dark:text-white bg-white dark:bg-green-950 items-center mb-8 p-6 shadow-2xl rounded-2xl">
          <div className="flex flex-col items-center justify-start">
            <img
              src={profile.profilePicture}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover shadow-lg"
            />
          </div>
          <div className="flex flex-col flex-1 bg-slate-100 text-black rounded-2xl p-6">
            <table className="w-full mb-4">
              <tbody>
                <tr>
                  <td className="font-medium">Imię i nazwisko: </td>
                  <td className="text-xl font-semibold">
                    <p>{profile.fullName}</p>
                  </td>
                </tr>
                <tr>
                  <td className="font-medium">Nazwa użytkownika: </td>
                  <td className="text-gray-600">@{profile.userName}</td>
                </tr>
                <tr>
                  <td className="font-medium">Adres email: </td>
                  <td className="text-gray-600">{profile.email}</td>
                </tr>
              </tbody>
            </table>
            {/* Change profile picture form */}
            <ChangeAvatarForm onUpdated={() => setRefresh(!refresh)} />
            <button
              className="w-full bg-red-600 hover:bg-red-700 hover:cursor-pointer text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              onClick={handleDelete}
            >
              Usuń konto
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
