
const BASE_URL = 'http://localhost:4000';

let mode = 'CREATE';
let selectedID = '';

const messageDOM = document.getElementById('message');

window.onload = async () => {

    const lastID = localStorage.getItem('lastEmployee');

    if(lastID){
        loadUser(lastID);
    }

}

//
// VALIDATION
//
const validateData = (userData) => {

    let errors = [];

    if (!userData.firstname) errors.push('กรุณากรอกชื่อ');
    if (!userData.lastname) errors.push('กรุณากรอกนามสกุล');
    if (!userData.dept) errors.push('กรุณาเลือกแผนก');
    if (!userData.checkIn) errors.push('กรุณากรอกเวลาเข้างาน');
    if (!userData.checkOut) errors.push('กรุณากรอกเวลาออกงาน');
    if (!userData.workdate) errors.push('กรุณาเลือกวันที่ทำงาน');

    return errors;
};

//
// LOAD USER
//
const loadUser = async (id) => {

    try {

        const response = await axios.get(`${BASE_URL}/EmployeeForm/${id}`);
        const user = response.data;

        document.querySelector('[name=firstname]').value = user.Firstname;
        document.querySelector('[name=lastname]').value = user.Lastname;
        document.querySelector('[name=dept]').value = user.Dept;
        document.querySelector('[name=checkin]').value = user.CheckIn;
        document.querySelector('[name=checkout]').value = user.CheckOut;
        document.querySelector('[name=workdate]').value = user.WorkDate;

        mode = 'UPDATE';
        selectedID = id;

    } catch (error) {
        console.log(error);
    }

};

//
// SUBMIT FORM
//
const submitData = async () => {

    let firstnameDOM = document.querySelector('[name=firstname]');
    let lastnameDOM = document.querySelector('[name=lastname]');
    let deptDOM = document.querySelector('[name=dept]');
    let checkinDOM = document.querySelector('[name=checkin]');
    let checkoutDOM = document.querySelector('[name=checkout]');
    let workdateDOM = document.querySelector('[name=workdate]');

    try {

    let userData = {
        firstname: firstnameDOM.value,
        lastname: lastnameDOM.value,
        workdate: workdateDOM.value,
        dept: deptDOM.value,
        checkin: checkinDOM.value,
        checkout: checkoutDOM.value
};  
        const errors = validateData(userData);

        if (errors.length > 0) {
            throw {
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                errors: errors
            };
        }

        if (mode === 'CREATE') {

            const response = await axios.post(`${BASE_URL}/EmployeeForm`, userData);

            localStorage.setItem('lastEmployee', response.data.id);

            window.location.href = "dashboard.html";

        } else {

            await axios.put(`${BASE_URL}/EmployeeForm/${selectedID}`, userData);

            window.location.href = "dashboard.html";

        }

    } catch (error) {

        console.log(error);

        let htmlData = `<div>${error.message}</div>`;

        if (error.errors) {

            htmlData += '<ul>';

            error.errors.forEach(err => {
                htmlData += `<li>${err}</li>`;
            });

            htmlData += '</ul>';
        }

        messageDOM.innerHTML = htmlData;
        messageDOM.className = 'message danger';
    }


};