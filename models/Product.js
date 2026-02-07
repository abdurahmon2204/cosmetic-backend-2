const Product = require('../models/Product');
const axios = require('axios');
const FormData = require('form-data');

// 1. Yangi mahsulot qo'shish (ImgBB orqali)
exports.addProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Rasm yuklanmadi!" });
        }

        // ImgBB API kalitini tekshirish
        const apiKey = process.env.IMGBB_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, message: "Serverda ImgBB API kalit topilmadi!" });
        }

        // 1. Rasmni ImgBB formatiga tayyorlash (Base64)
        const form = new FormData();
        form.append('image', req.file.buffer.toString('base64'));

        // 2. ImgBB-ga yuklash so'rovini yuborish
        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${apiKey}`,
            form,
            { headers: { ...form.getHeaders() } }
        );

        if (response.data.success) {
            const imageUrl = response.data.data.url;

            // 3. MongoDB-ga saqlash
            const newProduct = new Product({
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                category: req.body.category,
                image: imageUrl
            });

            await newProduct.save();
            res.status(201).json({ success: true, product: newProduct });
        } else {
            res.status(500).json({ success: false, message: "ImgBB yuklashda xatolik berdi." });
        }

    } catch (error) {
        console.error("Xato tafsiloti:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Rasm yuklashda xatolik: " + (error.response?.data?.error?.message || error.message) 
        });
    }
};

// 2. Barcha mahsulotlarni olish
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Bitta mahsulotni ID bo'yicha olish
exports.getSingleProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Mahsulot topilmadi" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Mahsulotni o'chirish
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Mahsulot topilmadi" });
        }

        // Eslatma: ImgBB bepul API-da rasm o'chirish biroz boshqacha, 
        // shuning uchun hozircha faqat bazadan o'chiramiz.
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Mahsulot muvaffaqiyatli o'chirildi!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};