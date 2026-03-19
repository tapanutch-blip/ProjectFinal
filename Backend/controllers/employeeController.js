const db = require('../config/db');
const calculateOT = require('../utils/calculateOT');

const SALARY_MAP = {
    IT:        22000,
    HR:        19000,
    Sale:      17000,
    Marketing: 15000
};

// ===================== GET ALL =====================
exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM EmployeeForm");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ===================== GET BY ID =====================
exports.getById = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM EmployeeForm WHERE id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบข้อมูล" });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ===================== CREATE =====================
exports.create = async (req, res) => {
    try {
        const rawDate  = req.body.WorkDate || req.body.workdate;
        const dept     = req.body.Dept     || req.body.dept;
        const workdate = rawDate ? rawDate.split('T')[0] : null;
        const checkin  = req.body.CheckIn  || req.body.checkin;
        const checkout = req.body.CheckOut || req.body.checkout;
        const user_id  = req.body.user_id;

        if (!checkin || !checkout) {
            return res.status(400).json({ message: "CheckIn หรือ CheckOut หาย" });
        }
        if (!user_id) {
            return res.status(400).json({ message: "user_id ไม่มีค่า" });
        }

        const otHours    = calculateOT(checkin, checkout);
        const baseSalary = SALARY_MAP[dept] || 0;
        const otPay      = otHours * 200;
        const totalPay   = baseSalary + otPay;

        const sql = `
            INSERT INTO EmployeeForm
            (user_id, dept, workdate, checkin, checkout, ot_hours, base_salary, ot_pay, total_pay)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            user_id, dept, workdate, checkin, checkout,
            otHours, baseSalary, otPay, totalPay
        ]);

        res.json({ success: true, message: "เพิ่มข้อมูลสำเร็จ", id: result.insertId });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ===================== UPDATE =====================
exports.update = async (req, res) => {
    try {
        const id   = req.params.id || req.body.id;
        const body = { ...req.body };

        if (body.workdate) body.workdate = body.workdate.split('T')[0];
        delete body.created_at;
        delete body.id;

        const [result] = await db.query(
            "UPDATE EmployeeForm SET ? WHERE id = ?",
            [body, id]
        );
        res.json({ message: "Update success", affectedRows: result.affectedRows });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ===================== DELETE =====================
exports.remove = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM EmployeeForm WHERE id = ?",
            [req.params.id]
        );
        res.json({ message: "Delete success", affectedRows: result.affectedRows });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ===================== MONTHLY REPORT =====================
exports.getMonthlyReport = async (req, res) => {
    try {
        const { userId } = req.params;
        let   { month  } = req.params;

        // รองรับทั้ง "2026-03" และ "3"
        if (!month.includes('-')) {
            const year = new Date().getFullYear();
            month = `${year}-${month.padStart(2, '0')}`;
        }

        const [rows] = await db.query(`
            SELECT
                workdate,
                dept,
                checkin,
                checkout,
                COALESCE(ot_hours,    0) AS ot_hours,
                COALESCE(ot_pay,      0) AS ot_pay,
                COALESCE(base_salary, 0) AS base_salary
            FROM EmployeeForm
            WHERE user_id = ?
              AND DATE_FORMAT(workdate, '%Y-%m') = ?
            ORDER BY workdate ASC
        `, [userId, month]);

        const totalOT    = rows.reduce((sum, r) => sum + parseFloat(r.ot_hours || 0), 0);
        const totalOTPay = rows.reduce((sum, r) => sum + parseFloat(r.ot_pay   || 0), 0);
        const baseSalary = rows.length > 0 ? parseFloat(rows[0].base_salary) : 0;
        const totalPay   = baseSalary + totalOTPay;

        res.json({
            success: true,
            data: rows,
            summary: { totalOT, totalOTPay, baseSalary, totalPay }
        });

    } catch (err) {
        console.error("Monthly report error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};