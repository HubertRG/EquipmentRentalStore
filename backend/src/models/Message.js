/*
    Zawiera:
    - imię i nazwisko nadawcy
    - e-mail
    - temat i treść wiadomości
    - datę wysłania
*/

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
