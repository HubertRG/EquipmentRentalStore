import React from "react";
import Navbar from "../components/Universal/Navbar";
import Footer from "../components/Universal/Footer";

/*
    Equipment catalog
    Equipment with images and filters (price per day, category, availability)
    Add new equipment and manage existing (admin only)
*/

export default function Catalog() {
  return (
    <>
      <Navbar />
      <div className="flex flex-wrap flex-col min-h-screen bg-gray-100 dark:bg-[#242424] p-4">
        <h2 className="text-2xl font-bold mb-4 text-center bg-green-950 p-3 rounded text-white shadow m-5">
          Katalog sprzętu
        </h2>
        <Footer />
      </div>
    </>
  );
}
