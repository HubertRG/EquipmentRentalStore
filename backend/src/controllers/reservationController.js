const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const mongoose = require("../config/db.js");
const Reservation = require("../models/Reservation");
const Equipment = require("../models/Equipment");
const tokenVerification = require("../middleware/tokenVerification.js");
const adminVerification = require("../middleware/adminVerification.js");

// POST / * Add new reservation (user validation, data validation)
router.post(
  "/",
  [
    body("equipment").notEmpty().withMessage("Sprzęt jest wymagany"),
    body("startDate").notEmpty().withMessage("Nie wybrano daty początkowej"),
    body("endDate").notEmpty().withMessage("Nie wybrano daty końcowej"),
    body("startTime").notEmpty().withMessage("Nie wybrano godziny odbioru"),
    body("endTime").notEmpty().withMessage("Nie wybrano godziny zwrotu"),
    body("pickupPlace")
      .notEmpty()
      .withMessage("Nie wybrano sposobu odbioru/zwrotu"),
    body("deliveryAddressPickup.city")
      .notEmpty()
      .withMessage("Podaj miasto odbioru"),
    body("deliveryAddressPickup.street")
      .notEmpty()
      .withMessage("Podaj ulicę odbioru"),
    body("deliveryAddressPickup.houseNumber")
      .notEmpty()
      .withMessage("Podaj numer domu odbioru"),
    body("deliveryAddressReturn.city")
      .notEmpty()
      .withMessage("Podaj miasto zwrotu"),
    body("deliveryAddressReturn.street")
      .notEmpty()
      .withMessage("Podaj ulicę zwrotu"),
    body("deliveryAddressReturn.houseNumber")
      .notEmpty()
      .withMessage("Podaj numer domu zwrotu"),
    body("price")
      .isNumeric()
      .withMessage("Cena musi być liczbą")
      .notEmpty()
      .withMessage("Cena jest wymagana"),
  ],
  tokenVerification,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const equipment = await Equipment.findById(req.body.equipment);

      if (!equipment) {
        return res.status(404).json({ message: "Sprzęt nie istnieje" });
      }

      const reservation = new Reservation({
        ...req.body,
        user: req.user._id,
      });

      await reservation.save();
      console.log("Dodano rezerwację");
      res.status(201).json(reservation);
    } catch (err) {
      console.log("Błąd przy dodawaniu rezerwacji: ", err);
      res.status(400).json({ message: err.message });
    }
  }
);

// GET / * Get list of reservations for current user
router.get("/", tokenVerification, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate({
        path: "equipment",
        select: "name category",
      })
      .lean();

    const now = new Date();
    const formatted = await Promise.all(
      reservations.map(async (r) => {
        const reservedNow = await Reservation.exists({
          equipment: r.equipment?._id,
          startDate: { $lte: now },
          endDate: { $gte: now },
        });
        return {
          _id: r._id,
          equipmentId: r.equipment?._id,
          equipmentName: r.equipment?.name || "Usunięty sprzęt",
          equipmentCategory: r.equipment?.category,
          startDate: r.startDate,
          endDate: r.endDate,
          startTime: r.startTime,
          endTime: r.endTime,
          pickupPlace: r.pickupPlace,
          deliveryAddressPickup: r.deliveryAddressPickup,
          deliveryAddressReturn: r.deliveryAddressReturn,
          price: r.price,
          isAvailable: !reservedNow,
          createdAt: r.createdAt,
        };
      })
    );

    res.json(formatted);
  } catch (err) {
    console.error("Błąd pobierania rezerwacji:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// GET /equipment/:id * Get info about equipment for chosen reservation
router.get("/equipment/:id", tokenVerification, async (req, res) => {
  try {
    const reservations = await Reservation.find({
      equipment: req.params.id,
    }).lean();
    res.json(reservations);
  } catch (err) {
    console.error("Błąd pobierania rezerwacji sprzętu:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// GET /admin * Get list of all reservations (admin only)
router.get("/admin", tokenVerification, async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate({
        path: "equipment",
        select: "name category",
      })
      .populate({ path: "user", select: "userName email" })
      .lean();

    const formattedReservations = reservations.map((reservation) => {
      return {
        _id: reservation._id,
        equipmentName: reservation.equipment?.name || "Usunięty sprzęt",
        equipmentCategory: reservation.equipment?.category,
        userName: reservation.user?.userName || "Nieznany użytkownik",
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        pickupPlace: reservation.pickupPlace,
        deliveryAddressPickup: reservation.deliveryAddressPickup,
        deliveryAddressReturn: reservation.deliveryAddressReturn,
        createdAt: reservation.createdAt,
      };
    });

    res.json(formattedReservations);
  } catch (err) {
    console.error("Błąd pobierania rezerwacji:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// DELETE /:id * Delete reservation with chosen id (data and user validation)
router.delete("/:id", tokenVerification, async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reservation) {
      return res.status(404).json({ message: "Rezerwacja nie znaleziona" });
    }
    console.log("Usunięto rezerwację");
    res.json({ message: "Rezerwacja usunięta" });
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera" }); 
    console.log(err);
  }
});

// DELETE /:id/admin * Delete chosen reservation (admin only)
router.delete("/:id/admin", adminVerification, async (req, res) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      console.log("Nie odnaleziono rezerwacji");
      return res.status(404).json({ message: "Rezerwacja nie znaleziona" });
    }
    console.log("Rezerwacja została usunięta");
    return res.status(201).json({ message: "Rezerwacja została usunięta" });
  } catch (err) {
    console.log("Błąd przy usuwaniu rezerwacji: ", err);
    return res
      .status(500)
      .json({ message: "Błąd przy usuwaniu rezerwacji: " + err });
  }
});

// PUT /:id * Update reservation with chosen id (user verification)
router.put("/:id", tokenVerification, async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: "Rezerwacja nie znaleziona" });
    }
    console.log("Zaktualizowano rezerwację");
    res.json(reservation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
