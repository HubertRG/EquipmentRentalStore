/*
    This module creates a connection with the database using:
        mongodb://localhost:27017/ProjectDB
    Use example:
        const mongoose = require('./config/db');
*/

const mongoose = require("mongoose");

const MONGO_URL =
  process.env.MONGO_URL || "mongodb://localhost:27017/ProjectDB";

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true })
  .then((result) => {
    console.log("Połączono z bazą: " + MONGO_URL);
  })
  .catch((err) => {
    console.log("Nie udało się połączyć z bazą danych: " + MONGO_URL + err);
  });

module.exports = mongoose;
