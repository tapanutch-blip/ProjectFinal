const BASE_URL = "http://localhost:4000";

// ===== โหลดข้อมูล Dashboard =====
window.onload = async () => {
  const id = localStorage.getItem("lastEmployee");
  if (!id) {
    alert("ไม่พบข้อมูลพนักงาน");
    window.location.href = "signin.html";
    return;
  }

  try {
    const res  = await axios.get(`${BASE_URL}/EmployeeForm/${id}`);
    const data = res.data;

    const firstname = localStorage.getItem('firstname') || "";
    const lastname  = localStorage.getItem('lastname')  || "";
    const fullname  = `${firstname} ${lastname}`.trim() || "-";
    const dept      = data.dept      || "-";
    const checkin   = data.checkin   || "-";
    const checkout  = data.checkout  || "-";
    const otHours   = data.ot_hours  || "-";
    const totalPay  = data.total_pay || "-";
    const workdate  = data.workdate
      ? new Date(data.workdate).toLocaleDateString('th-TH')
      : "-";

    // Main
    document.getElementById("info-fullname").innerText = fullname;
    document.getElementById("info-date").value         = workdate;
    document.getElementById("d-checkin").value        = checkin;
    document.getElementById("d-checkout").value       = checkout;
    document.getElementById("d-ot").value             = otHours !== "-" ? otHours + " ชม." : "-";
    const finalPay = parseFloat(data.total_pay) || totalPay;
    document.getElementById('d-salary').value = Number(finalPay).toLocaleString('th-TH') + " บาท";
    
    // Sidebar
    document.getElementById("side-name").innerText     = fullname;
    document.getElementById("side-dept").innerText     = dept;
    document.getElementById("side-date").innerText     = workdate;
    document.getElementById("side-checkin").innerText  = checkin;
    document.getElementById("side-checkout").innerText = checkout;

    // โหลดรูปโปรไฟล์จาก DB
    const userId = localStorage.getItem('user_id');
    const profileRes = await axios.get(`${BASE_URL}/auth/profile/${userId}`);
    const profileImgEl = document.getElementById('profileImg');
    if (profileRes.data.profile_image) {
      profileImgEl.src = `${BASE_URL}/uploads/profile/${profileRes.data.profile_image}`;
    } else {
      profileImgEl.src =
        `https://ui-avatars.com/api/?name=${firstname}+${lastname}&background=cccccc&color=ffffff&size=80`;
    }

  } catch (err) {
    console.error("Dashboard Error:", err);
  }
};

// ===== Logout =====
function handleLogout() {
  localStorage.clear();
  window.location.href = "signin.html";
}

// ===== PROFILE IMAGE =====
function previewImage(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];

    if (file.size > 10 * 1024 * 1024) {
      alert('ไฟล์ใหญ่เกินไป! ไม่เกิน 10MB');
      return;
    }

    // แสดงรูป preview บนหน้า
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('profileImg').src = e.target.result;
    };
    reader.readAsDataURL(file);

    // อัปโหลดไป backend
    uploadToServer(file);
  }
}

function uploadToServer(file) {
  const userId = localStorage.getItem('user_id');
  if (!userId) {
    alert("ไม่พบ user_id");
    return;
  }

  const formData = new FormData();
  formData.append('profile_image', file);
  formData.append('user_id', userId);

  axios.post(`${BASE_URL}/api/upload-profile`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  .then(res => {
    if (res.data.success) {
      alert('อัปโหลดรูปสำเร็จ!');
      // ใช้รูปจาก DB โดยตรง
      document.getElementById('profileImg').src =
        `${BASE_URL}/uploads/profile/${res.data.filename}`;
    } else {
      alert('อัปโหลดไม่สำเร็จ: ' + res.data.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert('เกิดข้อผิดพลาดในการอัปโหลด');
  });
function goToMonthly() {
  window.location.href = "monthly.html";
}
}