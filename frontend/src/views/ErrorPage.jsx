import React from "react";
import { NavLink } from "react-router";
import Footer from "../components/Universal/Footer";
import Navbar from "../components/Universal/Navbar";

/*
    Strona błędu
    Pokazywana przy błędnym adresie lub innym błędzie
    Umożliwia powrót do strony głównej
*/

export default function ErrorPage() {
  return (
    <div className="bg-slate-100 min-h-screen text-black dark:text-white">
      <Navbar />
      <h2>404 - Strona nie istnieje</h2>
      <NavLink to="/">
        <h4>Powrót do strony głównej</h4>
      </NavLink>
      <Footer />
    </div>
  );
}
