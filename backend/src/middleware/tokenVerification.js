/* 
    Reads Authorization header and verifies JWT token
*/

const jwt = require("jsonwebtoken");
require("dotenv").config();

function tokenVerification(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Brak tokenu autoryzacyjnego" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWTPRIVATEKEY, (err, decodeduser) => {
    if (err) {
      console.error("Błąd weryfikacji tokenu:", err);
      return res.status(401).json({ message: "Nieprawidłowy token" });
    }

    req.user = decodeduser;
    next();
  });
}

module.exports = tokenVerification;
