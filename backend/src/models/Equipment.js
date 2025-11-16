/*
    Ten model przechowuje:
    - nazwę i kategorię sprzętu
    - opis oraz cenę wynajmu za dzień
    - listę obrazów (URL-e)
    - listę rezerwacji powiązanych z tym sprzętem
*/

const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {type: String, required: true},
  pricePerDay: {type: Number, required: true},
  images: [String],
  reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reservation" }],
});

const Equipment = mongoose.model("Equipment", equipmentSchema);
module.exports = Equipment;
