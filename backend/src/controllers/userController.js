const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { User } = require("../models/User");
const Reservation = require("../models/Reservation");
const upload = require("../middleware/upload");
const adminVerification = require("../middleware/adminVerification");
const tokenVerification = require("../middleware/tokenVerification");

// GET / * Pobiera dane zalogowanego użytkownika (bez pola password).
router.get("/", tokenVerification, async (req, res) => {
  try {
    const u = await User.findById(req.user._id).lean().select("-password");
    if (!u) {
      return res.status(400).json({ message: "Nie znaleziono użytkownika" });
    }
    return res.status(201).json(u);
  } catch (err) {
    console.log("Błąd przy pobieraniu użytkownika: ", err);
    return res.status(500).json({ message: "Błąd: " + err });
  }
});

// GET /admin * Lista użytkowników — dostęp tylko dla admina.
router.get("/admin", adminVerification, async (req, res) => {
  try {
    const users = await User.find()
      .select("fullName role userName email phonenumber createdAt")
      .lean();
    if (!users) {
      console.log("Nie udało się pobrać użytkowników");
      return res
        .status(401)
        .json({ message: "Nie udało się pobrać użytkowników" });
    }
    return res.status(201).json(users);
  } catch (err) {
    console.log("Błąd przy pobieraniu użytkowników: ", err);
    return res
      .status(500)
      .json({ message: "Błąd przy pobieraniu użytkowników: " + err });
  }
});

// DELETE / * Usunięcie własnego konta wraz z rezerwacjami użytkownika.
router.delete("/", tokenVerification, async (req, res) => {
  try {
    await Reservation.deleteMany({ user: req.user._id });
    console.log("Usunięto zamówienia przypisane do konta: ", req.user._id);
    const deleted = await User.findByIdAndDelete(req.user._id);
    if (!deleted) {
      console.log("Nie udało się usunąć konta");
      return res.status(400).json({ message: "Nie udało się usunąć konta" });
    }
    console.log("Usunięto konto");
    return res.status(201).json({ message: "Usunięto konto" });
  } catch (err) {
    console.log("Błąd przy usuwaniu użytkownika: ", err);
    return res
      .status(500)
      .json({ message: "Błąd przy usuwaniu użytkownika: ", err });
  }
});

// DELETE /:id * Usunięcie konta o danym ID (tylko admin).
router.delete("/:id", adminVerification, async (req, res) => {
  try {
    await Reservation.deleteMany({ user: req.params.id });
    console.log("Usunięto zamówienia przypisane do konta: ", req.params.id);
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      console.log("Nie udało się usunąć konta");
      return res.status(400).json({ message: "Nie udało się usunąć konta" });
    }
    console.log("Usunięto konto");
    return res.status(201).json({ message: "Usunięto konto" });
  } catch (err) {
    console.log("Błąd przy usuwaniu użytkownika: ", err);
    return res
      .status(500)
      .json({ message: "Błąd przy usuwaniu użytkownika: ", err });
  }
});

// PUT /avatar * Zmiana zdjęcia profilowego. Usuwamy stare zdjęcie z dysku (jeśli nie jest domyślne).
router.put(
  "/avatar",
  tokenVerification,
  upload.single("avatar"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Brak pliku" });
    const user = await User.findById(req.user._id);
    if (user.profilePicture && !user.profilePicture.includes("cdn.pixabay")) {
      const old = path.join("uploads", path.basename(user.profilePicture));
      fs.unlink(old, () => {});
    }
    user.profilePicture = `http://localhost:3000/uploads/${req.file.filename}`;
    await user.save();
    console.log("Zmieniono zdjęcie profilowe");
    res.json({ profilePicture: user.profilePicture });
  }
);

// PUT / * Aktualizacja profilu (fullName, userName, email, phonenumber)
router.put(
  "/",
  [
    body("fullName").notEmpty().withMessage("Imię i nazwisko są wymagane"),
    body("userName").notEmpty().withMessage("Nazwa użytkownika jest wymagana"),
    body("email").notEmpty().withMessage("Adres email jest wymagany"),
    body("phonenumber").notEmpty().withMessage("Numer telefonu jest wymagany"),
  ],
  tokenVerification,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { fullName, userName, email, phonenumber } = req.body;
    try {
      const updated = await User.findByIdAndUpdate(
        req.user._id,
        { fullName, userName, email, phonenumber },
        { new: true, runValidators: true }
      ).lean();
      if (!updated) {
        console.log("Nie udało się zaktualizować konta");
        return res
          .status(400)
          .json({ message: "Nie udało się zaktualizować konta" });
      }
      console.log("Zaktualizowano konto");
      return res.status(201).json(updated);
    } catch (err) {
      console.log("Błąd przy edycji konta: ", err);
      return res
        .status(500)
        .json({ message: "Błąd przy edycji konta: " + err });
    }
  }
);

// PUT /password * Zmiana hasła użytkownika
router.put("/password", tokenVerification, async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword || !confirmPassword) {
    console.log("Błąd zmiany hasła: nie wszystkie pola są uzupełnione");
    return res
      .status(400)
      .json({
        message: "Błąd zmiany hasła: nie wszystkie pola są uzupełnione",
      });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Nowe hasła nie są zgodne" });
  }

  try {
    const user = await User.findById(req.user._id);

    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ message: "Stare hasło jest nieprawidłowe" });
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    console.log("Zmieniono hasło użytkownika");
    res.status(200).json({ message: "Hasło zostało zmienione pomyślnie" });
  } catch (err) {
    console.error("Błąd przy zmianie hasła:", err);
    res.status(500).json({ message: "Wewnętrzny błąd serwera" });
  }
});

module.exports = router;
