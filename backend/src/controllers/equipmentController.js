const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = require("../middleware/upload");
const Equipment = require("../models/Equipment");
const Reservation = require("../models/Reservation");
const adminVerification = require("../middleware/adminVerification");
const { body, validationResult } = require("express-validator");

// POST / * Dodanie nowego sprzętu (tylko dla admina, przesłanie i zapisanie ścieżek do zdjęć, weryfikacja danych)
router.post(
  "/",
  upload.array("images"),
  adminVerification,
  [
    body("name").notEmpty().withMessage("Nazwa jest wymagana"),
    body("description").notEmpty().withMessage("Opis jest wymagany"),
    body("pricePerDay").isNumeric().withMessage("Cena musi być liczbą").notEmpty().withMessage("Cena jest wymagana"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const files = req.files || [];
      const imagePaths = files.map((file) => file.path);
      const equipment = new Equipment({ ...req.body, images: imagePaths });
      await equipment.save();
      res.status(201).json(equipment);
      console.log("Dodano sprzęt");
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// GET / * Pobranie listy sprzętu razem ze zdjęciami
router.get("/", async (req, res) => {
  try {
    const equipment = await Equipment.find();
    const equipmentWithFullUrls = equipment.map((item) => ({
      ...item._doc,
      images: item.images.map(
        (img) => `http://localhost:3000/${img.split("/").pop()}`
      ),
    }));
    res.json(equipmentWithFullUrls);
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// GET /:equipmentId * Pobranie informacji o wybranym sprzęcie, razem ze zdjęciami
router.get("/:equipmentId", async (req, res) => {
  try {
    const eq = await Equipment.findById(req.params.equipmentId).lean();
    if (!eq) return res.status(404).json({ message: "Nie znaleziono sprzętu" });

    const equipmentWithFullUrls = {
      ...eq,
      images: eq.images.map(
        (img) => `http://localhost:3000/${img.split("/").pop()}`
      ),
    };

    const now = new Date();
    const reservedNow = await Reservation.exists({
      equipment: eq._id,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
    return res.json({
      ...equipmentWithFullUrls,
      isAvailable: !reservedNow,
    });
  } catch (err) {
    console.error("Błąd w GET /equipment/:id", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// DELETE /:id * Usunięcie wybranego sprzętu (tylko dla admina, usunięcie powiązanych rezerwacji)
router.delete("/:id", adminVerification, async (req, res) => {
  try {
    const equipId = req.params.id;

    await Reservation.deleteMany({ equipment: equipId });

    const deleted = await Equipment.findByIdAndDelete(equipId);
    if (!deleted) {
      return res.status(404).json({ message: "Sprzęt nie znaleziony" });
    }
    console.log("Usunięto sprzęt");
    res.json({ message: "Sprzęt i powiązane rezerwacje zostały usunięte" });
  } catch (err) {
    console.error("Błąd przy usuwaniu sprzętu:", err);
    res.status(500).json({ message: "Błąd serwera" });
  } finally {
  }
});

// PUT /:id * Aktualizacja wybranego sprzętu (tylko dla admina, możliwość usunięcia starych oraz przesłania nowych zdjęć, walidacja danych)
router.put(
  "/:id",
  upload.array("images"),
  adminVerification,
  [
    body("name").notEmpty().withMessage("Nazwa jest wymagana"),
    body("pricePerDay")
      .isNumeric()
      .withMessage("Cena musi być liczbą")
      .custom((v) => v > 0)
      .withMessage("Cena musi być większa od zera"),
    body("description").notEmpty().withMessage("Opis jest wymagany"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const equipment = await Equipment.findById(req.params.id);
      if (!equipment) {
        return res.status(404).json({ message: "Sprzęt nie znaleziony" });
      }

      const removed = req.body.removedImages || [];
      equipment.images = equipment.images.filter(
        (img) => !removed.includes(img)
      );

      const newFiles = req.files || [];
      const newImagePaths = newFiles.map((f) => f.path);
      equipment.images.push(...newImagePaths);

      equipment.name = req.body.name;
      equipment.category = req.body.category;
      equipment.description = req.body.description;
      equipment.pricePerDay = req.body.pricePerDay;

      const updated = await equipment.save();
      console.log("Zaktualizowano sprzęt");
      return res.json(updated);
    } catch (err) {
      console.error("Błąd przy edycji sprzętu:", err);
      return res.status(400).json({ message: err.message });
    }
  }
);

module.exports = router;
