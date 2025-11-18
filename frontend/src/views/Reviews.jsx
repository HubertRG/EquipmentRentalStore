import React from "react";
import Navbar from "../components/Universal/Navbar";
import Footer from "../components/Universal/Footer";

/*
    Reviews page
    User can leave new review here
    Existing reviews are being shown with average rating
*/

export default function Reviews() {
  return (
    <div className=" min-h-screen bg-gray-100 dark:bg-[#242424] text-black transition-colors duration-300">
      <Navbar />
      <Footer />
    </div>
  );
}
