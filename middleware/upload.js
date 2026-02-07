const multer = require('multer');

// 1. Rasmni vaqtincha RAMda (buffer ko'rinishida) ushlab turish
// ImgBB API-ga yuborish uchun aynan shu usul kerak
const storage = multer.memoryStorage();

// 2. Faylni tekshirish (Faqat rasm ekanligini aniqlash)
const fileFilter = (req, file, cb) => {
    // Rasm formatlarini tekshirish
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        // Xato xabarini yuborish
        cb(new Error('Faqat rasm yuklash mumkin! (jpg, png, jpeg, webp)'), false);
    }
};

// 3. Multer sozlamalarini birlashtirish
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter, 
    limits: { 
        fileSize: 32 * 1024 * 1024 // ImgBB bepul versiyasi 32MB gacha ruxsat beradi
    }
});

module.exports = upload;