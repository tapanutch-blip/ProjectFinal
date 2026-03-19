module.exports = function validateEmployee(req, res, next){

    const { Dept, WorkDate, CheckIn, CheckOut } = req.body;

    let errors = [];

    if(!Dept) errors.push("กรุณากรอกแผนก");
    if(!WorkDate) errors.push("กรุณากรอกวันที่");
    if(!CheckIn) errors.push("กรุณากรอกเวลาเข้างาน");
    if(!CheckOut) errors.push("กรุณากรอกเวลาออกงาน");

    if(errors.length > 0){
        return res.status(400).json({
            message: "ข้อมูลไม่ครบ",
            errors: errors
        });
    }

    next(); 
}