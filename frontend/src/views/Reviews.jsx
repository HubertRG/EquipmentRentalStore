import React from "react";
import Navbar from "../components/Navbar";

/*
    Strona recenzji
    Umożliwia dodanie nowej recenzji
    Wyświetla istniejące recenzje oraz średnią ocen z recenzji
*/

export default function Reviews() {
  return (
    <div className=" min-h-screen bg-gray-100 dark:bg-[#242424] text-black transition-colors duration-300">
      <Navbar />
    </div>
  );
}
