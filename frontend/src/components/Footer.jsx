import { IoLocationOutline } from "react-icons/io5";
import { FaPhone } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";

/**
    Stopka interfejsu
    Zawiera dane kontaktowe oraz godziny otwarcia sklepu
*/

export default function Footer() {
  return (
    <footer className="py-8 text-center text-sm text-gray-600 dark:text-gray-400">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col items-center">
          <IoLocationOutline className="text-4xl mb-3" />
          <h4 className="font-semibold mb-2">Avanti Wypożyczalnia</h4>
          <p>ul. Nadbystrzycka 38</p>
          <p>20-400 Lublin</p>
        </div>
        <div className="flex flex-col items-center">
          <FaPhone className="text-4xl mb-3" />
          <h4 className="font-semibold mb-2">Kontakt</h4>
          <p>Tel: +48 123 456 789</p>
          <p>Email: kontakt@avanti.pl</p>
        </div>
        <div className="flex flex-col items-center">
          <FaRegClock className="text-4xl mb-3" />
          <h4 className="font-semibold mb-2">Godziny otwarcia</h4>
          <p>Pn–Pt: 8:00–18:00</p>
          <p>Sob: 9:00–14:00</p>
          <p>Nd: nieczynne</p>
        </div>
      </div>
      <p className="mt-6">
        © {new Date().getFullYear()} Avanti. Wszystkie prawa zastrzeżone.
      </p>
    </footer>
  );
}
