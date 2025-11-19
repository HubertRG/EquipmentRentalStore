import React from "react";
import Navbar from "../components/Universal/Navbar";
import Footer from "../components/Universal/Footer";
import ContactForm from "../components/Contact/ContactForm";

/*
    Contact page
    Map with store's location
    Contact form
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
          {/* Store's location iframe */}
          <div className="w-full h-64">
            <iframe
              title="Mapa lokalizacji Avanti"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2498.1309302449768!2d22.546790312655574!3d51.23508352163478!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4722577729316bd9%3A0x442236391b743bc!2sPolitechnika%20Lubelska%2C%2020-618%20Lublin!5e0!3m2!1spl!2spl!4v1747135130788!5m2!1spl!2spl"
              width="100%"
              height="100%"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </section>
        <ContactForm />
      </div>
      <Footer />
    </div>
  );
}
