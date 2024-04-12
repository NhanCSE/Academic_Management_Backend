const Courses = require("../database/Courses");
const modelsError = require("../models/error");
const bcrypt = require("bcrypt");

const generateCourseId = async (info) => {
    let course_id
    let check
    let cnt = 0
    let type;
    switch (info.course_type) {
        case "Đại cương":
            type = "DC";
            break;
        case "GDTC":
            type = "TC";
            break;
        case "GDQP":
            type = "QP";
            break;
        case "Ngoại ngữ":
            type = "NN";
            break;
        case "Nhập môn":
            type = "NM";
            break;
        case "Quản lý":
            type = "QL";
            break;
        case "Cơ sở":
            type = "CS";
            break;
        case "Chuyên ngành":
            type = "CN";
            break;
        default:
            return modelsError.error(404, "Không tìm thấy loại môn học");
    }
    if(info.student_condition < 1 || info.student_condition > 5){
        return modelsError.error(400, "Sai điều kiện sinh viên");
    }
    let x = info.student_condition.toString()
    do{
        let randomNumber = Math.floor(Math.random() * 1000);
        let formattedNumber = randomNumber.toString().padStart(3, '0');
        course_id = type + x + formattedNumber;
        check = await Courses.checkExist({ course_id });
        cnt = cnt + 1;
        if(!check.success) {
            return modelsError.error(500, "Lỗi hệ thống cấp mã số");
        }
    } while(check.existed && cnt < 10000);
    if(cnt >= 10000) {
        return modelsError.error(400, "Quá số môn học cho phép");
    }
    return {
        success: true,
        course_id: course_id,
    }
}

const createCourse = async (info) => {
    const resultGeneratingID = await generateCourseId(info);
    if(!resultGeneratingID.success) {
        return resultGeneratingID;
    }
    info.course_id = resultGeneratingID.course_id;
    const creatingResult = await Courses.createNewCourse(info);
    if(creatingResult.success){
        return {
            success: true,
            message: `Tạo môn học mã ${info.course_id} thành công!`
        }
    }
    else return modelsError.error(500, createCourse.error);
}

const getManyCourses = async(condition) => {
    const result = await Courses.getManyCourses(condition);
    if(!result.success) {
        return result;
    }
    return {
        success: true,
        message: 'Truy vấn thông tin tất cả môn học thành công!',
        data: result.data
    }
}

const getAllCourses = async () => {
    const result = await Courses.getAllCourses();
    if(!result.success) {
        return result;
    }
    //console.log(result);
    return {
        success: true,
        message: 'Truy vấn thông tin tất cả môn học thành công!',
        data: result.data
    }
}

const updateCourse = async(course_id, updatingInfo) => {
    const checkExist = await Courses.checkExist({ course_id });

    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && !checkExist.existed) {
        return modelsError.error(404, `Không tìm thấy môn học có mã ${course_id}!`);
    }

    const result = await Courses.updateCourse(course_id , updatingInfo);

    if(!result.success) {
        return modelsError.error(500, result.error);
    }
    return {
        success: true,
        message: `Cập nhật môn học có mã ${course_id_id} thành công!`
    };
}

const deleteCourse = async(course_id) => {
    
    const checkExist = await Courses.checkExist({ course_id });

    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && !checkExist.existed) {
        return modelsError.error(404, `Không tìm thấy môn học có mã ${course_id}!`);
    }

    const deletedCourse = await Courses.deleteCourse(course_id);

    if(deletedCourse.success) {
        return {
            success: true,
            message: 'Xóa môn học mã ' + course_id + ' thành công!'
        };
    }
    else {
        return modelsError(500, deletedCourse.error);
    }
}

module.exports = {
    createCourse,
    getAllCourses,
    getManyCourses,
    updateCourse,
    deleteCourse,
    
}