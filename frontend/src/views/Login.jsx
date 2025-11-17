import React from "react";
import Navbar from "../components/Universal/Navbar";
import Footer from "../components/Universal/Footer";

/*
    Strona logowania
    Umożliwia zalogowanie się aplikacji
*/

export default function Login() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#242424]  transition-colors duration-300">
      <Navbar />
      <Footer />
    </div>
  );
}
