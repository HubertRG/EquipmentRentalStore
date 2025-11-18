import React from "react";
import Navbar from "../components/Universal/Navbar";
import Footer from "../components/Universal/Footer";

/*
    User profile page
    User can change profile picture and data (email, full name and username)
    User can also change password and delete account
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
