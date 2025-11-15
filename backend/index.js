const express = require("express");
const path = require("path");

const app = express();

//Importy routerów kontrolerów
const equipmentRoutes = require("./src/controllers/equipmentController.js");
const authorizationRoutes = require("./src/controllers/authController.js");
const userRoutes = require("./src/controllers/userController.js");

app.use(express.json());

//Przypisanie tras
app.use("/authorization", authorizationRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/user", userRoutes);
app.use("/equipment", equipmentRoutes);

app.listen(3000, () => {
  console.log("Aplikacja działa na porcie 3000");
});
