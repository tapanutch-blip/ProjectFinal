const BASE_URL = 'http://localhost:4000';

//  LOGIN 
async function doSignIn() {
    const username = document.getElementById('si-user').value.trim();
    const password = document.getElementById('si-pass').value;

    if (!username || !password) {
        Swal.fire({ icon: "error", title: "กรอกข้อมูลไม่ครบ" });
        return;
    }

    try {
        const res = await axios.post(`${BASE_URL}/auth/login`, { username, password });
        if (res.data.success) {
            localStorage.setItem('user_id',   res.data.user_id);
            localStorage.setItem('firstname', res.data.firstname); 
            localStorage.setItem('lastname',  res.data.lastname);  
            Swal.fire({ icon: "success", title: "เข้าสู่ระบบสำเร็จ" })
                .then(() => window.location.href = "salary.html");
        } else {
            Swal.fire({ icon: "error", title: "เข้าสู่ระบบไม่สำเร็จ", text: res.data.message });
        }
    } catch (err) {
        Swal.fire({ icon: "error", title: "Server Error", text: err.message });
    }
}
//  REGISTER 
async function doRegister() {
    const firstname = document.getElementById('reg-first').value.trim();
    const lastname  = document.getElementById('reg-last').value.trim();
    const username  = document.getElementById('reg-user').value.trim();
    const email     = document.getElementById('reg-email').value.trim();
    const password  = document.getElementById('reg-pass').value;

    if (!firstname || !lastname || !username || !email || !password) {
        Swal.fire({ icon: "error", title: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        return;
    }

    try {
        const res = await axios.post(`${BASE_URL}/auth/register`, { firstname, lastname, username, email, password });
        if (res.data.success) {
            console.log("Register response:", res.data);
            localStorage.setItem('user_id',   res.data.user_id);
            localStorage.setItem('firstname', firstname);
            localStorage.setItem('lastname',  lastname);
            Swal.fire({ icon: "success", title: "ลงทะเบียนสำเร็จ" })
                .then(() => window.location.href = "salary.html");
        } else {
            Swal.fire({
                icon: "error",
                title: "ลงทะเบียนไม่สำเร็จ",
                text: res.data.message || "Email หรือ Username ถูกใช้ไปแล้ว"
            });
        }
    } catch (err) {
        Swal.fire({ icon: "error", title: "Email หรือ Username ถูกใช้ไปแล้ว", text: err.message });
    }
}

//  SALARY
function setSalaryByDept() {
    const dept = document.getElementById('dept').value;
    const salaryMap = { HR: 19000, IT: 22000, Sale: 17000, Marketing: 15000 };
    document.getElementById('salary').value = salaryMap[dept] || '';
}

async function doSalarySubmit() {
    const storedUserId = localStorage.getItem('user_id');
    console.log("user_id:", storedUserId);
    if (!storedUserId) {
        Swal.fire({ icon: "error", title: "กรุณา Login ก่อน" });
        return;
    }

    const firstname = document.getElementById('firstname').value.trim();
    const lastname  = document.getElementById('lastname').value.trim();
    const dept      = document.getElementById('dept').value;
    const workdate  = document.getElementById('workdate').value;
    const checkin   = document.getElementById('checkin').value;
    const checkout  = document.getElementById('checkout').value;
    const salary    = parseFloat(document.getElementById('salary').value);

    if (!firstname || !lastname || !dept || !workdate || !checkin || !checkout) {
        Swal.fire({ icon: "error", title: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        return;
    }

    const checkinHour  = parseFloat(checkin.split(':')[0])  + parseFloat(checkin.split(':')[1])  / 60;
    const checkoutHour = parseFloat(checkout.split(':')[0]) + parseFloat(checkout.split(':')[1]) / 60;

    let otHour = checkoutHour - checkinHour - 8;
    if (otHour < 0) otHour = 0;

    try {
        const data = {
            user_id: parseInt(storedUserId),
            firstname, lastname, dept, workdate,
            checkin, checkout,salary
        };

        const res = await axios.post(`${BASE_URL}/EmployeeForm`, data);
         console.log("Response:", res.data); 

        if (res.data.id || res.data.success) {
    localStorage.setItem('lastEmployee', res.data.id || res.data.insertId); 
    Swal.fire({ icon: "success", title: "บันทึกสำเร็จ" })
        .then(() => window.location.href = "dashboard.html");
}
    } catch (err) {
        Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: err.message });
    }
}

// ===================== UPLOAD PROFILE =====================
function previewImage(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.size > 10 * 1024 * 1024) { alert('ไฟล์ใหญ่เกินไป! ไม่เกิน 10MB'); return; }

        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('profileImg').src = e.target.result;
            Swal.fire({ icon: "success", title: "อัปโหลดรูปสำเร็จ", timer: 1000, showConfirmButton: false });
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('profile_image', file);
        formData.append('user_id', localStorage.getItem('user_id'));

        axios.post(`${BASE_URL}/api/upload-profile`, formData)
            .then(res => { if (!res.data.success) console.error(res.data.message); })
            .catch(err => console.error(err));
    }
}

// ===================== DASHBOARD =====================
window.addEventListener('load', async () => {
    if (!window.location.pathname.includes('dashboard.html')) return;

    const userId  = localStorage.getItem('user_id');
    const lastEmp = localStorage.getItem('lastEmployee');

    if (!userId || !lastEmp) {
        alert("ไม่พบข้อมูลพนักงาน");
        window.location.href = "signin.html";
        return;
    }

    try {
        const res  = await axios.get(`${BASE_URL}/EmployeeForm/${lastEmp}`);
        const data = res.data;

        const firstname = localStorage.getItem('firstname') || "-";
        const lastname  = localStorage.getItem('lastname')  || "-";
        const fullname  = `${firstname} ${lastname}`;
        const dept      = data.dept     || "-";
        const checkin   = data.checkin  || "-";
        const checkout  = data.checkout || "-";
        const workdate  = data.workdate ? new Date(data.workdate).toLocaleDateString('th-TH') : "-";

        const otHours  = Number(data.ot_hours)  || 0;
        const totalPay = Number(data.total_pay) || 0;

        document.getElementById('info-fullname').innerText = fullname;
        document.getElementById('side-name').innerText     = fullname;
        document.getElementById('side-dept').innerText     = dept;
        document.getElementById('side-date').innerText     = workdate;
        document.getElementById('side-checkin').innerText  = checkin;
        document.getElementById('side-checkout').innerText = checkout;
        document.getElementById('d-checkin').value         = checkin;
        document.getElementById('d-checkout').value        = checkout;
        document.getElementById('info-date').value         = workdate;
        document.getElementById('d-ot').value              = otHours.toFixed(2) + " ชม.";
        document.getElementById('d-salary').value          = totalPay.toLocaleString('th-TH') + " บาท";

        const profileRes   = await axios.get(`${BASE_URL}/auth/profile/${userId}`);
        const profileImgEl = document.getElementById('profileImg');
        profileImgEl.src   = profileRes.data.profile_image
            ? `${BASE_URL}/uploads/profile/${profileRes.data.profile_image}`
            : `https://ui-avatars.com/api/?name=${firstname}+${lastname}&background=cccccc&color=ffffff&size=80`;

    } catch (err) {
        console.error("Dashboard Error:", err);
    }
});

// ===================== MONTHLY REPORT =====================
async function loadReport() {
    const userId = localStorage.getItem('user_id');
    const month  = document.getElementById('monthPicker').value;

    if (!month) {
        Swal.fire({ icon: "warning", title: "กรุณาเลือกเดือน" });
        return;
    }
    if (!userId) {
        Swal.fire({ icon: "error", title: "กรุณา Login ก่อน" });
        return;
    }

    try {
        const res  = await axios.get(`${BASE_URL}/EmployeeForm/monthly/${userId}/${month}`);
        const data = res.data.data;

        let html = "", totalOT = 0, totalOTPay = 0, baseSalary = 0;
        const salaryMap = { HR: 19000, IT: 22000, Sale: 17000, Marketing: 15000 };

        data.forEach((row, i) => {
            const otHours = Number(row.ot_hours)    || 0;
            const otPay   = Number(row.ot_pay)      || (otHours * 200);
            const base    = Number(row.base_salary) || salaryMap[row.dept] || 0;

            totalOT    += otHours;
            totalOTPay += otPay;
            if (i === 0) baseSalary = base;

            html += `<tr>
                <td>${new Date(row.workdate).toLocaleDateString('th-TH')}</td>
                <td>${row.checkin}</td>
                <td>${row.checkout}</td>
                <td>${otHours.toFixed(2)}</td>
                <td>${otPay.toLocaleString('th-TH')}</td>
            </tr>`;
        });

        const totalPay = baseSalary + totalOTPay;

        document.getElementById("reportTable").innerHTML =
            html || `<tr><td colspan="5">ไม่พบข้อมูลในเดือนนี้</td></tr>`;

        document.getElementById("summary").innerHTML = `
            เงินเดือน: ${baseSalary.toLocaleString('th-TH')} บาท
            &nbsp;|&nbsp; รวม OT: ${totalOT.toFixed(2)} ชม. (${totalOTPay.toLocaleString('th-TH')} บาท)
            &nbsp;|&nbsp; <strong>รวมทั้งหมด: ${totalPay.toLocaleString('th-TH')} บาท</strong>
        `;

    } catch (err) {
        console.error(err);
        alert("โหลดข้อมูลไม่สำเร็จ: " + err.message);
    }
}

// ===================== NAVIGATE =====================
function goToMonthly() {
    window.location.href = "monthly.html";
}

// ===================== LOGOUT =====================
function handleLogout() {
    localStorage.clear();
    window.location.href = "index.html";
}