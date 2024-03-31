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

const createSubject = async(info) => {
    const checkExist = await Students.checkExistSubject(info.subject_id);

    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && checkExist.existed) {
        return modelsError.error(404, "Môn học đã tồn tại!");
    }

    const creatingSubject = await Students.createNewSubject(info);
    if(creatingSubject.success) {
        return {
            success: true,
            message: 'Tạo môn học mã ' + info.subject_id + ' thành công!'
        };
    }
    else {
        return modelsError.error(500, creatingSubject.error);
    }
}

const getStudent = async(req) => {
    const checkStudent = await Students.getStudent(req);

    if(!checkStudent.success) {
        return modelsError.error(404, checkStudent.error);
    }
    if(checkStudent.success && !checkStudent.existed) {
        return modelsError.error(404, "Không tìm thấy thông tin người dùng!");
    }

    return {
        success: true,
        message: 'Truy vấn thông tin người dùng thành công!',
        data: checkStudent.data
    };
}

const getAllStudents = async() => {
    const getStudent = await Students.getAllStudents();

    if(!getStudent.success){
        return modelsError.error(404, getStudent.error);
    }

    return {
        success: true,
        message: 'Truy vấn thông tin tất cả sinh viên thành công!',
        data: getStudent.data
    }
}

const updateStudent = async(req) => {
    const checkExist = await Students.checkExist(req.params.id);

    if(!checkExist.success) {
        return modelsError.error(404, checkStudent.error);
    }
    if(checkExist.success && !checkExist.existed) {
        return modelsError.error(404, "Không tìm thấy thông tin người dùng!");
    }

    const updateStudent = await Students.updateStudent(req);

    if(updateStudent.success) {
        return {
            success: true,
            message: 'Cập nhật thông tin sinh viên mã ' + req.params.id + ' thành công!'
        };
    }
    else {
        return modelsError(500, updateStudent.error);
    }

}

const registerSubject = async(req) => {
    const checkExist = await Students.checkExist(req.params.id)

    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && !checkExist.existed) {
        return modelsError.error(404, "Không tìm thấy thông tin sinh viên!");
    }

    const checkRegister = await Students.registerSubject(req);
    if(checkRegister.success) {
        return {
            success: true,
            message: 'Đăng ký môn học thành công'
        };
    }
    else {
        return modelsError.error(500, checkRegister.error);
    }
}

module.exports = {
    createStudent,
    createSubject,
    getStudent,
    updateStudent,
    getAllStudents,
    registerSubject
}