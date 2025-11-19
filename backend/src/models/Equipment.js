/*
    Equipment model:
    - name and category
    - description and price per day
    - images list (URLs)
    - related reservations list
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
