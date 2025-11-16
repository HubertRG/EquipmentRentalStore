/*
    Ten moduł tworzy połączenie z bazą danych używając adresu:
        mongodb://localhost:27017/ProjectDB
    Przykład użycia:
        const mongoose = require('./config/db');
*/

const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/ProjectDB", { useNewUrlParser: true })
  .then((result) => {
    console.log("Połączono z bazą");
  })
  .catch((err) => {
    console.log("Nie udało się połączyć z bazą danych: " + err);
  });

module.exports = mongoose;
