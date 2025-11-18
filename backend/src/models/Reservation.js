/*
    Reservation model:
    - connect user with reserved equipment
    - saves date and time of loan and return
    - supports two types of collection: store and delivery
    - address of pickup and return
    - price and date
*/

const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  pickupPlace: {
    type: String,
    enum: ["store", "delivery"],
    default: "store",
    required: true,
  },
  deliveryAddressPickup: {
    city: { type: String, required: true },
    street: { type: String, required: true },
    houseNumber: { type: String, required: true },
  },
  deliveryAddressReturn: {
    city: { type: String, required: true },
    street: { type: String, required: true },
    houseNumber: { type: String, required: true },
  },
  price: { type: Number, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Reservation = mongoose.model("Reservation", reservationSchema);
module.exports = Reservation;
