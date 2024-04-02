const Students = require("../database/Students");
const modelsError = require("../models/error");
const utils = require("../lib/utils");

const generateStudentId = async() => {
    do{
        student_id = "22" + (Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000).toString();
        check = await Students.checkExist(student_id);
    } while(check.success && check.existed)
    return student_id;
}

const createStudent = async (info) => {
    // const checkExist = await Students.checkExist(info.student_id);
    
    // if(!checkExist.success) {
    //     return modelsError.error(404, checkExist.error);
    // }
    // if(checkExist.success && checkExist.existed) {
    //     return modelsError.error(404, "Sinh viên đã tồn tại từ trước!")
    // }
    
    info.student_id = await generateStudentId();
    info.username = info.email.substring(0, info.email.indexOf('@'));
    // Password ban đầu là số CCCD
    info.password = utils.hash(info.credential_id);
    info.active = 0;

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

const getInfoStudent = async(req) => {
    const checkStudent = await Students.getInfoStudent(req);

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

const updateInfoStudent = async(req) => {
    const checkExist = await Students.checkExist(req.user.student_id);

    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && !checkExist.existed) {
        return modelsError.error(404, "Không tìm thấy thông tin người dùng!");
    }

    const updateStudent = await Students.updateInfoStudent(req);

    if(updateStudent.success) {
        return {
            success: true,
            message: 'Cập nhật thông tin sinh viên mã ' + req.user.student_id + ' thành công!'
        };
    }
    else {
        return modelsError(500, updateStudent.error);
    }

}

const registerSubject = async(req) => {
    const checkExist = await Students.checkExist(req.user.student_id)

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
    getInfoStudent,
    updateInfoStudent,
    getAllStudents,
    registerSubject
}