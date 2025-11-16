const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

//Importy routerów kontrolerów
const reservationRoutes = require("./src/controllers/reservationController.js");
const equipmentRoutes = require("./src/controllers/equipmentController.js");
const authorizationRoutes = require("./src/controllers/authController.js");
const userRoutes = require("./src/controllers/userController.js");
const reviewRoutes = require("./src/controllers/reviewController.js");
const messageRoutes = require("./src/controllers/messageController.js");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

//Przypisanie tras
app.use("/authorization", authorizationRoutes);
app.use("/reservation", reservationRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/user", userRoutes);
app.use("/equipment", equipmentRoutes);
app.use("/review", reviewRoutes);
app.use("/message", messageRoutes);

app.listen(3000, () => {
  console.log("Aplikacja działa na porcie 3000");
});
