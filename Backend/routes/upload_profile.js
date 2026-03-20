const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const db      = require('../config/db'); // ไฟล์เชื่อมต่อ MySQL ของคุณ

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profile/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext      = path.extname(file.originalname);
    const userId   = req.body.user_id||'unknown';
    const newName  = `profile_${Date.now()}${ext}`;
    cb(null, newName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('ประเภทไฟล์ไม่ถูกต้อง'));
  }
});

// Route รับอัปโหลด
router.post('/upload-profile', upload.single('profile_image'), async (req, res) => {
  try {
    console.log("Body :",req.body);
    console.log("File :",req.file);
    console.log("User_Id :",req.body.user_id);
    const userId = req.body.user_id;
    if (!userId) return res.json({ success: false, message: 'ไม่พบ user_id' });

    // เปลี่ยนชื่อไฟล์ให้มี user_id
    const ext         = path.extname(req.file.originalname);
    const newFilename = req.file.filename;
    const oldPath     = req.file.path;
    const newPath     = `uploads/profile/${newFilename}`;
    fs.renameSync(oldPath, newPath); // ← เปลี่ยนชื่อไฟล์

    const [rows] = await db.query('SELECT profile_image FROM users WHERE id = ?', [userId]);
    if (rows[0]?.profile_image) {
      const oldImg = `uploads/profile/${rows[0].profile_image}`;
      if (fs.existsSync(oldImg)) fs.unlinkSync(oldImg);
    }

    // อัปเดต DB
    await db.query('UPDATE users SET profile_image = ? WHERE id = ?', [newFilename, userId]);

    res.json({ success: true, filename: newFilename });

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/get-profile (ส่ง user_id มา แล้วได้รูปกลับ)
router.post('/get-profile', async (req, res) => {
  try {
    const userId = req.body.user_id;
    if (!userId) return res.json({ success: false, message: 'ไม่พบ user_id' });

    const [rows] = await db.query(
      'SELECT profile_image FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) return res.json({ success: false, message: 'ไม่พบ user' });

    const profileImage = rows[0].profile_image;
    const imageUrl = profileImage
      ? `http://localhost:4000/uploads/profile/${profileImage}`
      : null;

    res.json({
      success: true,
      profile_image: profileImage,
      image_url: imageUrl
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;