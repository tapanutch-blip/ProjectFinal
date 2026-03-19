const BASE_URL = "http://localhost:4000";
window.onload = async () => {
    await loadData();
}

const loadData = async () => {
    const response = await axios.get(`${BASE_URL}/users`); //axiosใช้จัดการlibaryเพื่อดึงข้อมูล
    console.log(response.data); //เรียกใช้ด้วย.data
    const userDOM = document.getElementById("user");
    let htmlData = '<div>';
    for (let i = 0; i < response.data.length; i++) {
        let user = response.data[i];
        htmlData += ` <div>
        ${user.id} ${user.firstname} ${user.lastname} ${user.gender}

        <a href="index.html?id=${user.id}">Edit</a>
        <button class='delete' data-id='${user.id}'>Delete</button>
        </div>`
    }
    htmlData += '</div>';
    userDOM.innerHTML = htmlData;

    const deleteDOMs = document.getElementsByClassName("delete");
    for (let i = 0; i < deleteDOMs.length; i++) {
        deleteDOMs[i].addEventListener("click", async (event) => {
            // ดึง id ของ user ที่ต้องการลบจาก data-id attribute
            const id = event.target.dataset.id;
            try{
                await axios.delete(`${BASE_URL}/users/${id}`);
                loadData(); // โหลดข้อมูลใหม่หลังจากลบสำเร็จ
            }catch(error){
                console.error("Error deleting user:", error);
            }    
        });
    }
}

