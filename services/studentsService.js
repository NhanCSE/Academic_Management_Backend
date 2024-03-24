const Students = require("../database/Students");
const modelsError = require("../models/error");

const createStudent = async (info) => {
    const checkExist = await Students.checkExist(info.student_id);
    
    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && checkExist.existed) {
        return modelsError.error(404, "Sinh viên đã tồn tại từ trước!")
    }
    
    const creatingResult = await Students.createNewStudent(info);
    if(creatingResult.success) {
        return {
            success: true,
            message: `Tạo sinh viên mã ${info.student_id} thành công!`
        }
    } 
    else {
        return modelsError.error(500, createStudent.error);
    }

}

module.exports = {
    createStudent,
}