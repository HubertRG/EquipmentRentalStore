import React, {useState} from "react";
import Navbar from "../components/Universal/Navbar";
import Footer from "../components/Universal/Footer";
import AddReview from "../components/Review/AddReview";
import ReviewsTable from "../components/Review/ReviewsTable";

/*
    Reviews page
    User can leave new review here
    Existing reviews are being shown with average rating
*/

export default function Reviews() {
  const [refresh, setRefresh] = useState(false);
  return (
    <div className=" min-h-screen bg-gray-100 dark:bg-[#242424] text-black transition-colors duration-300">
      <Navbar />
      <ReviewsTable refresh={refresh} />
      <AddReview refresh={refresh} setRefresh={setRefresh} /> 
      <Footer />
    </div>
  );
}
