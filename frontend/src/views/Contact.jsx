import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/*
    Strona kontaktowa
    Wyświetla iframe z mapą z zaznaczoną lokalizacją sklepu oraz formularz kontaktowy służący do zadania pytania
*/

export default function Contact() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#242424] text-black dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <section className="my-8 p-5 rounded-2xl shadow-2xl bg-white dark:bg-green-950">
          <h2 className="text-2xl text-center font-bold mb-4">
            Znajdź nas tutaj
          </h2>
        </section>
      </div>
      <Footer />
    </div>
  );
}
