const Courses = require("../database/Courses");
const Classes = require("../database/Classes");
const modelsError = require("../models/error");

//Hàm hỗ trợ tạo course_id
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
    } while(check.existed && cnt < 1000);
    if(cnt >= 1000) {
        return modelsError.error(400, "Quá số môn học cho phép");
    }
    return {
        success: true,
        course_id: course_id,
    }
}

//Hàm tạo môn học
const createCourse = async (info) => {
    //Kiểm tra course_id của môn đó có tồn tại trong db chưa
    const checkExist = await Courses.checkExist({ course_name: info.course_name });
    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && checkExist.existed) {
        return modelsError.error(409, "Môn học đã tồn tại từ trước!")
    }
    //Tạo course_id bằng hàm hỗ trợ trên
    const resultGeneratingID = await generateCourseId(info);
    if(!resultGeneratingID.success) {
        return resultGeneratingID;
    }
    info.course_id = resultGeneratingID.course_id;
    //Nếu req truyền lên không có field là course_condition thì gán cho nó là mảng trống []
    if(!info.hasOwnProperty('course_condition')) {
        info.course_condition = new Array();
    }
    //Tạo môn học ở Database
    const creatingResult = await Courses.createNewCourse(info);
    if(creatingResult.success){
        return {
            success: true,
            message: `Tạo môn học mã ${info.course_id} thành công!`
        }
    }
    else return modelsError.error(500, createCourse.message);
}

//Hàm dùng để lấy thông tin của một số môn học
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
//Hàm dùng để lấy thông tin All môn học hiện có
const getAllCourses = async () => {
    const result = await Courses.getAllCourses();
    if(!result.success) {
        return result;
    }
    return {
        success: true,
        message: 'Truy vấn thông tin tất cả môn học thành công!',
        data: result.data
    }
}

//Hàm dùng để cập nhật thông tin môn học
const updateCourse = async(course_id, updatingInfo) => {
    //Ktra Môn học có tồn tại ko
    const checkExist = await Courses.checkExist({ course_id });

    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && !checkExist.existed) {
        return modelsError.error(404, `Không tìm thấy môn học có mã ${course_id}!`);
    }
    //Cập nhật thông tin ở db
    const result = await Courses.updateCourse(course_id , updatingInfo);

    if(!result.success) {
        return modelsError.error(500, result.error);
    }
    return {
        success: true,
        message: `Cập nhật môn học có mã ${course_id} thành công!`
    };
}

//Xóa môn học bằng course_id
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

//Lấy thông tin All Lớp của MH bằng course_id
const getAllClassesInCourse = async(course_id) => {
    const course = await Courses.getOneCourse({ course_id });
    const dbCollection = `courses/${course.data.id}/classes`;
    return await Classes.getAllClasses(dbCollection);
}

module.exports = {
    createCourse,
    getAllCourses,
    getManyCourses,
    updateCourse,
    deleteCourse,
    getAllClassesInCourse,
}