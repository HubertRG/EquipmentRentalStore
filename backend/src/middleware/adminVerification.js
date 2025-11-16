/* 
    Sprawdza, czy zalogowany użytkownik ma rolę "admin"
    Najpierw uruchamia tokenVerification, a następnie wczytuje użytkownika z DB i sprawdza rolę
*/
const tokenVerification = require("./tokenVerification");
const {User} = require("../models/User");

function adminVerification(req, res, next) {
  tokenVerification(req, res, async () => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "Użytkownik nie został znaleziony" });
      }
      
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Brak uprawnień administratora" });
      }
      next();
    } catch (error) {
      console.error("Błąd przy sprawdzaniu uprawnień administratora:", error);
      return res.status(500).json({ message: "Wystąpił błąd serwera" });
    }
  });
}

module.exports = adminVerification;
