const Students = require("../database/Students");
const modelsError = require("../models/error");
const bcrypt = require("bcrypt");
const utils = require("../lib/utils");
const moment = require("moment");
var nodemailer = require("nodemailer");

const generateStudentId = async(suffix) => {
    let student_id;
    let check;
    let cnt = 0;
    do{
        student_id = suffix + (Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000).toString();
        check = await Students.checkExist(student_id);
        cnt = cnt + 1;
        if(!check.success) {
            return modelsError.error(500, "Lỗi hệ thống cấp mã số");
        }
    } while(check.existed && cnt < 1000000);
    if(cnt >= 1000000) {
        return modelsError.error(400, "Quá số sinh viên cho phép");
    }
    return {
        success: true,
        student_id: student_id,
    }
}

const generateUsername = (fullname, student_id) => {
    // Convert Vietnamese characters to English
    const vietnameseToEnglish = {
        'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'đ': 'd',
        'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y'
    };
    fullname = fullname.split(" ");
    fullname = fullname[0] + " " + fullname[fullname.length - 1];
    const username = fullname.toLowerCase()
                     .split(" ") // Split into array of words
                     .map(word => word.split('') // Split word into array of characters
                                      .map(char => vietnameseToEnglish[char] || char) // Convert each character
                                      .join('')) // Join characters back into word
                     .reverse() // Reverse the array (last name first)
                     .join('.'); // Join with '.' between last name and first name

    return username + student_id;
}

const createStudent = async (info) => {
    const admissionTime = new Date();
    const admissionMoment = moment(admissionTime);
    const checkExist = await Students.checkExist(info.credential_id);
    
    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && checkExist.existed) {
        return modelsError.error(409, "Sinh viên đã tồn tại từ trước!")
    }

    // Xử lí thời hạn học tập
    info.admission = admissionMoment.format("DD-MM-YYYY");
    if(info.level === "Đại học") {
        if(info.program === "CQ" || info.program === "CLC") {
            info.exclusion = admissionMoment.add(4, "years").format("DD-MM-YYYY");
        } else if(info.program === "VHVL") {
            info.exclusion = admissionMoment.add(6, "years").format("DD-MM-YYYY");
        }
    } else if (info.level === "Cao học") {
        info.exclusion = admissionMoment.add(2, "years").format("DD-MM-YYYY");
    }
    // Cấp mã số sinh viên
    let suffix = admissionTime.getFullYear().toString().slice(-2);
    if(info.level === "Đại học") {
        if(info.program === "CQ") {
            suffix = suffix + "1";
        } else if(info.program === "CLC") {
            suffix = suffix + "2";
        } else if(info.program === "VHVL") {
            suffix = suffix + "3";
        }
    } else if (info.level === "Cao học") {
        suffix = suffix + "4";
    }
    const resultGeneratingID = await generateStudentId(suffix);
    if(!resultGeneratingID.success) { return resultGeneratingID; }
    info.student_id = resultGeneratingID.student_id;

    info.username = generateUsername(info.fullname, info.student_id);
    info.email = info.username + "@hcmut.edu.vn";
    // Password ban đầu là số CCCD
    info.password = utils.hash(info.credential_id);
    info.active = 0;

    const creatingResult = await Students.createNewStudent(info);
    if(creatingResult.success) {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'anhduy8a1vx52412312022004@gmail.com',
              pass: 'rqbn psax tpfh yxji'
                // user: 'nhantranibm5100@gmail.com',
                // pass: 'dtzd zgdx lcrr ieej'
            }
          });
          const link = "http://localhost:5000/api/v1/students/reser_password/........"
          var mailOptions = {
            from: 'youremail@gmail.com',
            to: info.contact_email,
            subject: 'Reset Password',
            text: 'Tài khoản của bạn được tạo thành công với thông tin người dùng được cung cấp bên dưới'
            + '\nUsername: ' + info.username 
            + '\nPassword: ' + info.credential_id 
            + '\nĐể đổi mật khẩu vui lòng truy cập đường link sau: ' + link,
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
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

const getOneStudent = async(condition) => {
    const result = await Students.getOneStudent(condition);

    if(!result.success) {
        return result;
    }
    return {
        success: true,
        message: 'Truy vấn thông tin sinh viên dùng thành công!',
        data: result.data
    };
}

const getManyStudents = async(condition) => {
    const result = await Students.getManyStudents(condition);
    if(!result.success) {
        return result;
    }

    return {
        success: true,
        message: 'Truy vấn thông tin tất cả sinh viên thành công!',
        data: result.data
    }
}

const getAllStudents = async () => {
    const result = await Students.getAllStudents();
    if(!result.success) {
        return result;
    }
    console.log(result);

    return {
        success: true,
        message: 'Truy vấn thông tin tất cả sinh viên thành công!',
        data: result.data
    }
}

const updateInfoStudent = async(student_id, updatedField) => {
    const checkExist = await Students.checkExist(student_id);

    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && !checkExist.existed) {
        return modelsError.error(404, `Không tìm thấy thông tin sinh viên có mã ${student_id}!`);
    }

    const updateStudent = await Students.updateInfoStudent(student_id , updatedField);

    if(!updateStudent.success) {
        return modelsError.error(500, updateStudent.error);
    }

    return {
        success: true,
        message: `Cập nhật thông tin sinh viên có mã ${student_id} thành công!`
    };
}

const deleteStudent = async(student_id) => {
    
    const checkExist = await Students.checkExist(student_id);

    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && !checkExist.existed) {
        return modelsError.error(404, `Không tìm thấy thông tin sinh viên có mã ${student_id}!`);
    }

    const deletedStudent = await Students.deleteStudent(student_id);

    if(deletedStudent.success) {
        return {
            success: true,
            message: 'Xóa sinh viên mã ' + student_id + ' thành công!'
        };
    }
    else {
        return modelsError(500, deletedStudent.error);
    }
}

//
const registerSubject = async(info, user) => {

    const checkRegister = await Students.registerSubject(info, user);
    if(checkRegister.success && checkRegister.valid && !checkRegister.conflict) {
        return {
            success: true,
            message: 'Đăng ký môn học thành công'
        };
    }
    else if(checkRegister.success && !checkRegister.valid) {
        return {
            success: true,
            message: 'Đăng ký môn học thất bại. Không đáp ứng môn học tiên quyết!'
        }
    }
    else if(checkRegister.success && checkRegister.conflict) {
        return {
            success: true,
            message: 'Đăng ký môn học thất bại do trùng lịch học!'
        }
    }
    else {
        return modelsError.error(500, checkRegister.error);
    }
}

const deleteRegisteredSubject = async(info, user) => {
    const checkDelete = await Students.deleteRegisteredSubject(info, user);
    if(checkDelete.success) {
        return {
            success: true,
            message: 'Hủy đăng ký môn học mã ' + info.course_id + ' thành công!'
        };
    }
    else {
        return modelsError.error(500, checkRegister.error);
    }
}

const getClasses = async(info) => {
    const checkGetting = await Students.getClasses(info);
    
    if(checkGetting.success) {
        return {
            success: true,
            message: 'Truy vấn thông tin các lớp học của mã môn học ' + info.course_id + ' thành công!',
            data: checkGetting.data
        };
    } 
    else {
        return modelsError.error(500, checkGetting.error);
    }
}

const getRegisteredClasses = async(user) => {
    const checkGetting = await Students.getRegisteredClasses(user);
    
    if(checkGetting.success) {
        return {
            success: true,
            message: 'Truy vấn thông tin các môn học đã đăng ký thành công!',
            data: checkGetting.data
        };
    } 
    else {
        return modelsError.error(500, checkGetting.error);
    }
}

const updatePassword = async(info) => {

    const Student = await Students.getOneStudent({ username: info.username });
    if(!Student.data || Student.data.length === 0) {
        return modelsError.error(404, `Sinh viên có tài khoản ${info.username} không tồn tại!`);
    }

    const match = bcrypt.compareSync(info.password, Student.data.password);

    if (!match) {
        return modelsError.error(409, "Mật khẩu không đúng!");
    }

    const updatedField = {
        password: utils.hash(info.new_password),
        active: 1
    }

    const resultUpdatingStudent = await updateInfoStudent(Student.data.student_id, updatedField);
    if(!resultUpdatingStudent.success) {
        return modelsError.error(500, resultUpdatingStudent.error);
    }

    return {
        success: true,
        message: `Cập nhật thông tin sinh viên có mã ${Student.data.student_id} thành công!`
    };

}



const getScore = async(info, user) => {
    const checkScore = await Students.getScore(info, user);

    if(!checkScore.success) {
        return modelsError.error(404, checkScore.error);
    }
    if(checkScore.success && !checkScore.existed) {
        return modelsError.error(404, "Không tìm thấy điểm cho học kỳ này!");
    }

    return {
        success: true,
        message: 'Truy vấn thông tin điểm học kỳ ' + info.semester + ' thành công!',
        data: checkScore.data
    };
}
module.exports = {
    createStudent,
    createSubject,
    getOneStudent,
    getAllStudents,
    getManyStudents,
    updateInfoStudent,
    deleteStudent,
    registerSubject,
    deleteRegisteredSubject,
    getClasses,
    getRegisteredClasses,
    updatePassword,
    getScore
}