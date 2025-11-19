const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { body, validationResult } = require("express-validator");
const adminVerification = require("../middleware/adminVerification");

// POST / * Add new message (validate data)
router.post(
  "/",
  [
    body("fullName").notEmpty().withMessage("Imię i nazwisko są wymagane"),
    body("email")
      .notEmpty()
      .withMessage("Adres email jest wymagany")
      .isEmail()
      .withMessage("Proszę podać prawidłowy adres email"),
    body("subject").notEmpty().withMessage("Temat wiadomości jest wymagany"),
    body("content").notEmpty().withMessage("Treść wiadomości jest wymagana"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let message = new Message(req.body);
    try {
      await message.save();
      console.log("Zapisano wiadomość");
      res.status(201).json({ message: "Zapisano wiadomość" });
    } catch (err) {
      console.log("Błąd podczas wysyłania wiadomości: " + err);
      res
        .status(400)
        .json({ message: "Błąd podczas wysyłania wiadomości: " + err });
    }
  }
);

// GET / * Get list of messages (admin only)
router.get("/", adminVerification, async (req, res) => {
  try {
    const messages = await Message.find();
    return res.status(201).json(messages);
  } catch (err) {
    console.log("Błąd przy pobieraniu wiadomości: ", err);
    return res
      .status(500)
      .json({ message: "Błąd przy pobieraniu wiadomości: " + err });
  }
});

// DELETE /:id * Delete message with chosen id (admin only)
router.delete("/:id", adminVerification, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      console.log("Nie znaleziono wiadomości");
    }
    console.log("Usunięto wiadomość");
    return res.status(201).json({ message: "Usunięto wiadomość" });
  } catch (err) {
    console.log("Błąd przy usuwaniu wiadomości: ", err);
    return res
      .status(400)
      .json({ message: "Błąd przy usuwaniu wiadomości: " + err });
  }
});

module.exports = router;
