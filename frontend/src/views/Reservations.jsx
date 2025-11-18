import React from "react";
import Navbar from "../components/Universal/Navbar";
import Footer from "../components/Universal/Footer";

/*
    Reservations page
    User can add new reservation
    Existing reservations for current user are shown in a table
*/

export default function Reservations() {
  return (
    <>
      <Navbar />
      <div className="flex flex-wrap flex-col min-h-screen bg-gray-100 dark:bg-[#242424] p-4">
        <h2 className="text-2xl font-bold mb-4 text-center bg-green-950 p-3 rounded text-white shadow m-5">
          Rezerwacje
        </h2>
        <Footer />
      </div>
    </>
  );
}
