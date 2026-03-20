const express = require('express');
const router = express.Router();
const db = require('../config/db');

const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT profile_image FROM users WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) return res.json({ profile_image: null });
        
        // ส่งชื่อไฟล์จริง (ใน DB) กลับไป
        res.json({ profile_image: rows[0].profile_image || null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ profile_image: null });
    }
});

router.get('/EmployeeForm/monthly/:userId/:month', async (req, res) => {
  try {
    const { userId, month } = req.params;

    const [rows] = await db.query(`
      SELECT *,
        GREATEST(TIME_TO_SEC(TIMEDIFF(checkout, checkin))/3600 - 8, 0) AS ot_hours,
        salary + (GREATEST(TIME_TO_SEC(TIMEDIFF(checkout, checkin))/3600 - 8, 0) * (salary/22/8)) AS total_pay
      FROM employeeform
      WHERE user_id = ? 
      AND DATE_FORMAT(workdate, '%Y-%m') = ?
      ORDER BY workdate ASC
    `, [userId, month]);

    // รวมค่า
    let totalOT = 0;
    let totalPay = 0;

    rows.forEach(r => {
      totalOT += parseFloat(r.ot_hours || 0);
      totalPay += parseFloat(r.total_pay || 0);
    });

    res.json({
      success: true,
      data: rows,
      summary: {
        totalOT,
        totalPay
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



module.exports = router;