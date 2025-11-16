/*
    Przechowuje:
    - nazwę użytkownika (fullName)
    - ocenę liczbową 1–5
    - opcjonalny komentarz
    - datę wystawienia recenzji
*/

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
