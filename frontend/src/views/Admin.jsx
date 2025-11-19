import React from "react";
import Navbar from "../components/Universal/Navbar";
import Footer from "../components/Universal/Footer";
import AdminUsersTable from "../components/Admin/AdminUsersTable";
import AdminReservationsTable from "../components/Admin/AdminReservationsTable";

/*
    Admin's panel
    Manage users, messages, reviews and reservations
*/

export default function Admin() {
  return (
    <div className="bg-slate-100 min-h-screen dark:bg-[#242424] text-black dark:text-white transition-colors duration-300">
      <Navbar />
      <h2 className="text-2xl font-bold mb-4 text-center bg-green-950 p-3 rounded text-white shadow-2xl m-5">
        Panel administratora
      </h2>
      <AdminUsersTable />
      <AdminReservationsTable />
      <Footer />
    </div>
  );
}
