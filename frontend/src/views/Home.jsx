import React from "react";
import Navbar from "../components/Universal/Navbar";
import Footer from "../components/Universal/Footer";

/*
    Strona główna
    Wyświetla ogólne informacje o sprzęcie i usługach
    Umożliwia przejście do katalogu
    Dla zalogowanego użytkownika przejście do rezerwacji, dla niezalogowanego do rejestracji
*/

export default function Home() {
  return (
    <div className="bg-slate-100 min-h-screen dark:bg-[#242424] text-black dark:text-white transition-colors duration-300">
      <Navbar />
      <section className="flex flex-col items-center justify-center text-center py-20 px-4">
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
          Wypożyczalnia Sprzętu Sportowego
        </h1>
      </section>
      <Footer />
    </div>
  );
}
