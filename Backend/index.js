const express = require('express');
const cors = require('cors');

const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoute = require('./routes/upload_profile');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/EmployeeForm', employeeRoutes);
app.use('/auth', authRoutes);
app.use('/api', uploadRoute);


// serve uploaded images
app.use('/uploads', express.static('uploads'));

app.listen(4000, '0.0.0.0', () => {
    console.log('Backend running at http://localhost:4000');
});

app.get('/EmployeeForm/monthly/:userId/:month', async (req, res) => {
    const { userId, month } = req.params; // month format: "2026-03"
    
    const [rows] = await db.query(`
        SELECT 
            workdate, checkin, checkout,
            COALESCE(ot_hours, 0) AS ot_hours,
            COALESCE(total_pay, base_salary, 0) AS total_pay
        FROM EmployeeForm
        WHERE user_id = ?
          AND DATE_FORMAT(workdate, '%Y-%m') = ?
        ORDER BY workdate ASC
    `, [userId, month]);

    const totalOT  = rows.reduce((sum, r) => sum + parseFloat(r.ot_hours), 0);
    const totalPay = rows.reduce((sum, r) => sum + parseFloat(r.total_pay), 0);

    res.json({ data: rows, summary: { totalOT, totalPay } });
});