/* 
    Configuration:
    - storage: files are saved in 'uploads/'
    - filename: unique name with timestampe + random
    - fileFilter: accept only image/jpeg, image/png, image/webp
    - limits: max size of 5 MB

    Exports multer instance, which is used in routes:
    - upload.single('avatar')  -> one file
    - upload.array('images')  -> many files
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