    const db = require('../config/db');
    const bcrypt = require('bcrypt');

    exports.register = async (req, res) => {
    try {                                           
        const { firstname, lastname, username, email, password } = req.body;

        const [existingUser] = await db.query(
            "SELECT id FROM users WHERE username=?", [username]
        );
        if (existingUser.length > 0) {
            return res.json({ success: false, message: "Username นี้ถูกใช้งานแล้ว" });
        }

        const [existingEmail] = await db.query(
            "SELECT id FROM users WHERE email=?", [email]
        );
        if (existingEmail.length > 0) {
            return res.json({ success: false, message: "Email นี้ถูกใช้งานแล้ว" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            "INSERT INTO users (firstname, lastname, username, email, password) VALUES (?,?,?,?,?)",
            [firstname, lastname, username, email, hashed]
        );

        res.json({
            success:   true,
            message:   "สมัครสมาชิกสำเร็จ",
            user_id:   result.insertId,
            firstname: firstname,
            lastname:  lastname
        });

    } catch (err) {                                
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด: " + err.message });
    }
}
    exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [rows] = await db.query(
            "SELECT * FROM users WHERE username=?",
            [username]
        );

        if (rows.length === 0) {
            return res.json({ success: false, message: "Username หรือ Password ไม่ถูกต้อง" });
        }

        const match = await bcrypt.compare(password, rows[0].password);

        if (!match) {
            return res.json({ success: false, message: "Username หรือ Password ไม่ถูกต้อง" });
        }

        res.json({
            success: true,
            user_id: rows[0].id,
            firstname: rows[0].firstname,
            lastname: rows[0].lastname
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
