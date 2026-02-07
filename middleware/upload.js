const multer = require('multer');

// 1. Rasmni vaqtincha RAMda (buffer ko'rinishida) ushlab turish
// Bu Firebase-ga upload qilish uchun eng qulay usul
const storage = multer.memoryStorage();

// 2. Faylni tekshirish (Faqat rasm ekanligini aniqlash)
const fileFilter = (req, file, cb) => {
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
    fileFilter: fileFilter, // Tekshiruvchi funksiyani ulaymiz
    limits: { 
        fileSize: 5 * 1024 * 1024 // Maksimal 5MB hajmdagi rasm
    }
});

module.exports = upload;