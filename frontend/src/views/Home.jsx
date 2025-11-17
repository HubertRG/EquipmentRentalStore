import React from "react";
import Navbar from "../components/Universal/Navbar";
import Footer from "../components/Universal/Footer";
import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router";
import { IoIosSpeedometer } from "react-icons/io";
import { RiSparkling2Line } from "react-icons/ri";
import { LuHandHelping } from "react-icons/lu";

/*
    Strona główna
    Wyświetla ogólne informacje o sprzęcie i usługach
    Umożliwia przejście do katalogu
    Dla zalogowanego użytkownika przejście do rezerwacji, dla niezalogowanego do rejestracji
*/

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="bg-slate-100 min-h-screen dark:bg-[#242424] text-black dark:text-white transition-colors duration-300">
      <Navbar />
      <section className="flex flex-col items-center justify-center text-center py-20 px-4">
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
          Wypożyczalnia Sprzętu Sportowego
        </h1>
        <p className="text-xl mb-6 max-w-2xl">
          Rowery, narty, kajaki i wiele więcej – wszystko w jednym miejscu.
          Szybka rezerwacja online, darmowa dostawa i pomoc 7 dni w tygodniu.
        </p>
        {user ? (
          <NavLink
            to="/reservations"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Zarezerwuj sprzęt już dziś
          </NavLink>
        ) : (
          <NavLink
            to="/register"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Zarejestruj się żeby zarezerwować sprzęt
          </NavLink>
        )}
      </section>

      <section className="py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Dlaczego my?</h2>
        <div className="dark:text-black max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-2xl transition-shadow duration-300">
            <IoIosSpeedometer
              alt="Szybkość"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h3 className="font-semibold mb-2">Ekspresowa rezerwacja</h3>
            <p>
              Rezerwuj sprzęt w kilka sekund i odbierz go już tego samego dnia.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-2xl transition-shadow duration-300">
            <RiSparkling2Line alt="Jakość" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Najwyższa jakość</h3>
            <p>
              Regularnie serwisujemy i wymieniamy sprzęt, abyś miał pewność
              bezpieczeństwa.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-2xl transition-shadow duration-300">
            <LuHandHelping alt="Wsparcie" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">24/7 Wsparcie</h3>
            <p>
              Jesteśmy do Twojej dyspozycji o każdej porze, by pomóc w wyborze i
              rezerwacji.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50 dark:bg-green-950">
        <h2 className="text-3xl font-bold text-center mb-12">
          Nasze kategorie
        </h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="block overflow-hidden rounded-lg shadow hover:shadow-lg transition">
            <div
              className="h-40 bg-cover bg-center"
              style={{ backgroundImage: `url('/bike.jpg')` }}
            />
            <h3 className="text-xl font-semibold text-center py-4 bg-white dark:text-black">
              Rowery
            </h3>
          </div>
          <div className="block overflow-hidden rounded-lg shadow hover:shadow-lg transition">
            <div
              className="h-40 bg-cover bg-center"
              style={{ backgroundImage: `url('/ski.jpg')` }}
            />
            <h3 className="text-xl font-semibold text-center py-4 bg-white dark:text-black">
              Narty
            </h3>
          </div>
          <div className="block overflow-hidden rounded-lg shadow hover:shadow-lg transition">
            <div
              className="h-40 bg-cover bg-center"
              style={{ backgroundImage: `url('/kayak.jpg')` }}
            />
            <h3 className="text-xl font-semibold text-center py-4 bg-white dark:text-black">
              Kajaki
            </h3>
          </div>
          <div className="block overflow-hidden rounded-lg shadow hover:shadow-lg transition">
            <div
              className="h-40 bg-cover bg-center"
              style={{ backgroundImage: `url('/board.jpg')` }}
            />
            <h3 className="text-xl font-semibold text-center py-4 bg-white dark:text-black">
              Inne
            </h3>
          </div>
        </div>
        <div className="text-center mt-12">
          <NavLink
            to="/catalog"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Sprawdź pełną ofertę
          </NavLink>
        </div>
      </section>
      <Footer />
    </div>
  );
}
