/* 
    Konfiguracja:
    - storage: zapis plików do folderu 'uploads/'
    - filename: unikalna nazwa z timestampem + random
    - fileFilter: akceptujemy tylko image/jpeg, image/png, image/webp
    - limits: maksymalny rozmiar pliku 5 MB

    Eksportuje instancję multer, którą używamy w route'ach:
    - upload.single('avatar')  -> jeden plik
    - upload.array('images')  -> wiele plików
*/
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Niedozwolony typ pliku'), false);
    }
  };
  
  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
  });
  
  module.exports = upload;