const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { User } = require("../models/User");
const Equipment = require("../models/Equipment");
const Review = require("../models/Review");
const Message = require("../models/Message");

const equipmentData = [
  {
    name: "Kajak Turystyczny",
    category: "Sporty wodne",
    description:
      "Wytrzymały kajak jednoosobowy, idealny na rzeki i jeziora. W zestawie wiosło i kamizelka.",
    pricePerDay: 50,
    images: ["kajak1.jpg", "kajak2.jpg"],
    reservations: [],
  },
  {
    name: "Rower Górski MTB",
    category: "Rowery",
    description:
      "Profesjonalny rower górski z pełnym zawieszeniem. Doskonały na trudne szlaki.",
    pricePerDay: 80,
    images: ["rower_mtb.jpg"],
    reservations: [],
  },
  {
    name: "Narty Zjazdowe Pro",
    category: "Sporty zimowe",
    description:
      "Narty dla średniozaawansowanych. Świetna przyczepność na stoku.",
    pricePerDay: 45,
    images: ["narty_pro.jpg"],
    reservations: [],
  },
  {
    name: "Deska SUP",
    category: "Sporty wodne",
    description:
      "Stabilna deska do pływania na stojąco. Hit ostatnich sezonów.",
    pricePerDay: 60,
    images: ["sup_board.jpg"],
    reservations: [],
  },
  {
    name: "Deska Windsurfingowa",
    category: "Sporty wodne",
    description:
      "Kompletny zestaw dla początkujących i średniozaawansowanych miłośników windsurfingu.",
    pricePerDay: 110,
    images: ["windsurf.jpg", "zagiel.jpg"],
    reservations: [],
  },
  {
    name: "Rower Miejski Retro",
    category: "Rowery",
    description:
      "Stylowy rower miejski, idealny na weekendowe wycieczki po mieście.",
    pricePerDay: 30,
    images: ["rower_retro.jpg"],
    reservations: [],
  },
  {
    name: "Snowboard All-Mountain",
    category: "Sporty zimowe",
    description:
      "Uniwersalna deska snowboardowa, świetna zarówno na stok, jak i poza nim.",
    pricePerDay: 65,
    images: ["snowboard.jpg"],
    reservations: [],
  },
];

const reviewData = [
  {
    fullName: "Anna Kowalska",
    rating: 5,
    comment:
      "Sprzęt w świetnym stanie! Rower górski spisał się idealnie na szlakach.",
  },
  {
    fullName: "Piotr Nowak",
    rating: 4,
    comment:
      "Kajaki dostarczone na czas. Mały problem z klamrą w kamizelce, ale ogólnie bardzo polecam.",
  },
  {
    fullName: "Marzena Wójcik",
    rating: 5,
    comment: "Bardzo miła obsługa i super narty. Wrócę na pewno!",
  },
  {
    fullName: "Krzysztof Zając",
    rating: 3,
    comment:
      "Deska SUP trochę porysowana, ale pływało się dobrze. Cena mogłaby być niższa.",
  },
];

const messageData = [
  {
    fullName: "Tomasz Wrona",
    email: "tomasz.wrona@test.pl",
    subject: "Pytanie o dostępność",
    content:
      "Czy Deska Windsurfingowa jest dostępna w przyszły weekend (10-11 grudnia)? Potrzebuję na 2 dni.",
  },
  {
    fullName: "Joanna Sokołowska",
    email: "joanna.sokolowska@info.pl",
    subject: "Kwestia faktury",
    content:
      "Proszę o wystawienie faktury VAT za ostatnie wypożyczenie rowerów. Dane firmowe wysyłam w załączniku.",
  },
  {
    fullName: "Mateusz Borowski",
    email: "mateusz.b@kontakt.pl",
    subject: "Współpraca",
    content:
      "Jesteśmy lokalną agencją turystyczną i chcielibyśmy omówić możliwość współpracy.",
  },
];

const seedAll = async () => {
  console.log("Rozpoczynam seedowanie danych...");

  try {
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Admin123!", salt);

      const newAdmin = new User({
        fullName: "Główny Administrator",
        userName: "admin",
        email: "admin@admin.pl",
        phonenumber: 123456789,
        password: hashedPassword,
        role: "admin",
        profilePicture:
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
      });

      await newAdmin.save();
      console.log(
        "Utworzono konto administratora (login: admin, hasło: Admin123!)"
      );
    } else {
      console.log("Administrator już istnieje");
    }

    const equipmentCount = await Equipment.countDocuments();

    if (equipmentCount === 0) {
      await Equipment.insertMany(equipmentData);
      console.log(`Dodano ${equipmentData.length} sztuk sprzętu do bazy.`);
    } else {
      console.log(
        "Baza sprzętu nie jest pusta - pomijam dodawanie przykładowych danych."
      );
    }

    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      await Review.insertMany(reviewData);
      console.log(`Dodano ${reviewData.length} recenzji.`);
    } else {
      console.log("Baza recenzji nie jest pusta.");
    }

    const messageCount = await Message.countDocuments();
    if (messageCount === 0) {
      await Message.insertMany(messageData);
      console.log(`Dodano ${messageData.length} wiadomości kontaktowych.`);
    } else {
      console.log("Baza wiadomości nie jest pusta.");
    }
  } catch (error) {
    console.error("Błąd podczas seedowania:", error);
  }
};

module.exports = seedAll;
