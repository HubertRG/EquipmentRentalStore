import React from "react";
import Navbar from "../components/Navbar";

/*
    Panel administratora
    Dostępny tylko dla użytkownika o roli admin
    Wyświetla listę i umożliwia usuwanie wybranych użytkowników, rezerwacji, wiadomości i recenzji
*/

export default function Admin() {
  return (
    <div className="bg-slate-100 min-h-screen dark:bg-[#242424] text-black dark:text-white transition-colors duration-300">
      <Navbar />
      <h2 className="text-2xl font-bold mb-4 text-center bg-green-950 p-3 rounded text-white shadow-2xl m-5">
        Panel administratora
      </h2>
    </div>
  );
}
