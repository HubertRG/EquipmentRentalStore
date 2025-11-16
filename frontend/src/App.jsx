import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./views/Home.jsx";
import Catalog from "./views/Catalog.jsx";
import Reviews from "./views/Reviews.jsx";
import Reservations from "./views/Reservations.jsx";
import Register from "./views/Register.jsx";
import Login from "./views/Login.jsx";
import Admin from "./views/Admin.jsx";
import Contact from "./views/Contact.jsx";
import Profile from "./views/Profile.jsx";
import ErrorPage from "./views/ErrorPage.jsx";

/*
  Główny komponent aplikacji odpowiedzialny za konfigurację routingu.
  Ostatnia ścieżka (*) obsługuje przypadek wpisania nieistniejącego adresu (ErrorPage)
*/

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
