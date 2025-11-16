import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/*
    Panel użytkownika
    Wyświetla informacje o aktualnie zalogowanym użytkowniku
    Umożliwia zmianę zdjęcia profilowego, danych, hasła oraz usunięcie konta
*/

export default function Profile() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-[#242424] p-4 transition-colors duration-300">
        <h1 className="text-3xl text-black dark:text-white font-bold mb-6">
          Mój profil
        </h1>
        <Footer />
      </div>
    </>
  );
}
