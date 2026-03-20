const BASE_URL = "http://localhost:4000";

// ===== โหลดข้อมูล Dashboard =====
window.addEventListener('load', async () => {
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
    const otHours   = Number(data.ot_hours)  || 0;
    const totalPay  = Number(data.total_pay) || 0;
    const workdate  = data.workdate
      ? new Date(data.workdate).toLocaleDateString('th-TH')
      : "-";

    // Main
    document.getElementById("info-fullname").innerText = fullname;
    document.getElementById("info-date").value         = workdate;
    document.getElementById("d-checkin").value         = checkin;
    document.getElementById("d-checkout").value        = checkout;
    document.getElementById("d-ot").value              = otHours.toFixed(2) + " ชม.";
    document.getElementById("d-salary").value          = totalPay.toLocaleString('th-TH') + " บาท";

    // Sidebar
    document.getElementById("side-name").innerText     = fullname;
    document.getElementById("side-dept").innerText     = dept;
    document.getElementById("side-date").innerText     = workdate;
    document.getElementById("side-checkin").innerText  = checkin;
    document.getElementById("side-checkout").innerText = checkout;

    // โหลดรูปโปรไฟล์
    const userId     = localStorage.getItem('user_id');
    const profileRes = await axios.get(`${BASE_URL}/auth/profile/${userId}`);
    const profileImgEl = document.getElementById('profileImg');
    profileImgEl.src = profileRes.data.profile_image
      ? `${BASE_URL}/uploads/profile/${profileRes.data.profile_image}`
      : `https://ui-avatars.com/api/?name=${firstname}+${lastname}&background=cccccc&color=ffffff&size=80`;

  } catch (err) {
    console.error("Dashboard Error:", err);
  }
});

// ===== Logout =====
function handleLogout() {
  localStorage.clear();
  window.location.href = "signin.html";
}

// ===== Navigate =====
function goToMonthly() {
  window.location.href = "monthly.html";
}

// ===== PROFILE IMAGE =====
function previewImage(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];

    if (file.size > 10 * 1024 * 1024) {
      alert('ไฟล์ใหญ่เกินไป! ไม่เกิน 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('profileImg').src = e.target.result;
    };
    reader.readAsDataURL(file);

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
}