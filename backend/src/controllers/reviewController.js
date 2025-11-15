const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const { body, validationResult } = require("express-validator");
const adminVerification = require("../middleware/adminVerification");

// POST / * Dodanie nowej recenzji (walidacja danych)
router.post(
  "/",
  [
    body("fullName").notEmpty().withMessage("Imię i nazwisko są wymagane"),
    body("rating")
      .isNumeric()
      .withMessage("Ocena musi być liczbą")
      .notEmpty()
      .withMessage("Ocena jest wymagana"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    let review = new Review();
    review.fullName = req.body.fullName;
    review.rating = req.body.rating;
    review.comment = req.body.comment || "";
    try {
      await review.save();
      console.log("Dodano recenzję");
      res.status(201).json({ message: "Dodano recenzję" });
    } catch (err) {
      console.log("Błąd podczas dodawanie recenzji: " + err);
      res
        .status(500)
        .json({ message: "Błąd podczas dodawania recenzji: " + err });
    }
  }
);

// GET / * Pobranie listy recenzji (obliczenie średniej oceny)
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find();
    const avg =
      reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);

    return res.status(201).json({ reviews, averageRating: avg.toFixed(1) });
  } catch (err) {
    console.log("Błąd przy pobieraniu recenzji: ", err);
    return res
      .status(500)
      .json({ message: "Błąd przy pobieraniu recenzji: " + err });
  }
});

// GET /admin * Pobranie listy recenzji dla admina
router.get("/admin", adminVerification, async (req, res) => {
  try {
    const reviews = await Review.find();
    return res.status(201).json(reviews);
  } catch (err) {
    console.log("Błąd przy pobieraniu recenzji: ", err);
    return res
      .status(500)
      .json({ message: "Błąd przy pobieraniu recenzji: " + err });
  }
});

// DELETE /:id * Usunięcie recenzji o wybranym id (tylko dla admina)
router.delete("/:id", adminVerification, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      console.log("Nie znaleziono recenzji");
    }
    console.log("Usunięto recenzję");
    return res.status(201).json({ message: "Usunięto recenzję" });
  } catch (err) {
    console.log("Błąd przy usuwaniu recenzji: ", err);
    return res
      .status(400)
      .json({ message: "Błąd przy usuwaniu recenzji: " + err });
  }
});

module.exports = router;
