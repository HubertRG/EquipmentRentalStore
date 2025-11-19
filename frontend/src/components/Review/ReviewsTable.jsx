import React, { useState, useEffect } from "react";
import axios from "axios";

/*
    Reviews table component
    Shows reviews with star rating and average rating
*/

export default function ReviewsTable({refresh}){
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  // Fetch reviews and average rating
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/review`);
        setReviews(res.data.reviews);
        setAverage(res.data.averageRating);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReviews();
  }, [refresh]);
    return(<section className="flex flex-col items-center justify-center bg-white dark:bg-green-950 dark:text-slate-100 text-center mt-10 py-20 px-4 transition-colors duration-300">
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-2">Opinie klientów</h1>
            <p className="mb-4">Średnia ocena: {average} / 5</p>

            <ul className="space-y-6 ">
              {reviews.map((r) => (
                <li key={r._id} className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-green-900 rounded-xl shadow-sm p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-green-800 dark:text-green-300">{r.fullName}</p>
                    <p text-sm text-gray-500>{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-yellow-500 text-lg">
                    Ocena: {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
                  </p>
                  <p className="mt-3 text-gray-800 dark:text-slate-100">{r.comment}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>);
};