import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

/*
    Add review component
    If user is logged in, dont show fullname input field, get fullname from localstorage
    Show options from 1-5
    Comment optional
*/

const MySwal = withReactContent(Swal);

export default function AddReview({ refresh, setRefresh }) {
  const { user } = useAuth();
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    rating: 5,
    comment: "",
  });
  const validate = () => {
    const e = {};
    if (!form.fullName) e.fullName = "Podaj imię i nazwisko";
    if (!form.rating) e.rating = "Twoja opinia jest wymagana";
    return e;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) {
      console.log(err);
      setErrors(err);
      return;
    }
    try {
      await axios.post("http://localhost:3000/review", form);
      setForm((f) => ({ ...f, comment: "" }));
      setRefresh(!refresh);
      MySwal.fire("Dodano recenzję","","success");
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <div className="flex flex-wrap flex-col items-center mt-5">
        <h2 className="text-xl font-semibold mb-2 dark:text-white">
          Dodaj opinię
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 w-full max-w-md bg-white p-6 rounded-xl shadow-lg transition-colors duration-300"
        >
          {!user && (
            <>
              <div>
                <label className="block font-medium mb-1">
                  Imię i nazwisko
                </label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 bg-slate-100"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>
            </>
          )}
          <div>
            <label className="block font-medium mb-1">Ocena</label>
            <select
              name="rating"
              value={form.rating}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 bg-slate-100"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Twoja opinia</label>
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none bg-slate-100"
              rows="4"
            />
          </div>
          <div className="flex flex-wrap text-center flex-col">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition "
            >
              Dodaj opinię
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
