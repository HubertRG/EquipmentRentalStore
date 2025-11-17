const router = require("express").Router();
const { User, validate } = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
require("dotenv").config();

// POST /signup * Rejestracja nowego użytkownika (walidacja danych za pomocą express-validatora, sprawdzenie unikalności)
router.post(
  "/signup",
  [
    body("fullName").notEmpty().withMessage("Imię i nazwisko są wymagane"),
    body("userName").notEmpty().withMessage("Nazwa użytkownika jest wymagana"),
    body("email").notEmpty().withMessage("Adres email jest wymagany"),
    body("phonenumber").notEmpty().withMessage("Numer telefonu jest wymagany"),
    body("password").notEmpty().withMessage("Hasło jest wymagane"),
    body("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("Nieprawidłowa rola"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { error } = validate(req.body);
      if (error)
        return res.status(400).send({ message: error.details[0].message });
      const emailCheck = await User.findOne({ email: req.body.email });
      if (emailCheck)
        return res
          .status(409)
          .send({ message: "User with given email already exists!" });
      const userNameCheck = await User.findOne({ userName: req.body.userName });
      if (userNameCheck)
        return res
          .status(409)
          .send({ message: "User with given username already exists!" });
      const { fullName, userName, email, phonenumber, password } = req.body;
      let role = req.body.role && req.body.role === "admin" ? "admin" : "user";
      if (role === "admin") {
        const adminKey =
          req.headers["x-admin-key"] || req.body.adminKey || null;
        if (!adminKey || adminKey !== process.env.ADMIN_CREATION_KEY) {
          return res
            .status(403)
            .json({ message: "Nieprawidłowy klucz tworzenia administratora" });
        }
      }
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const passwordHash = await bcrypt.hash(password, salt);
      const user = new User({
        fullName,
        userName,
        email,
        phonenumber,
        password: passwordHash,
        role,
      });
      await user.save();
      res.status(201).send({ message: "User created succesfully" });
      console.log("User created sucesfully");
    } catch (error) {
      res.status(500).send({ message: "Internal server error" });
      console.log("Internal server error: ", error);
    }
  }
);

// POST /login * Uwierzytelnienie użytkownika (sprawdzenie poprawności danych, wygenerowanie tokenu)
router.post("/login", async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(401).send({ message: "Invalid Email or Password" });
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(401).send({ message: "Invalid Email or Password" });
    const token = user.generateAuthToken();
    res.status(200).send({
      token: token,
      user: {
        _id: user._id,
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
      message: "Logged in successfully",
    });
    console.log("Logged in", token);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
    console.log(error);
    console.log(process.env.JWTPRIVATEKEY);
  }
});

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = router;
