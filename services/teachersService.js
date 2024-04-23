const Teachers = require("../database/Teachers");
const Classes = require("../database/Classes");
//const Teachers = require("../database/Teachers");
const modelsError = require("../models/error");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const utils = require("../lib/utils");
const { messaging } = require("firebase-admin");

const generateTeacherId = async(suffix) => {
    let teacher_id;
    let check;
    let cnt = 0;
    do{
        teacher_id = suffix + (Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000).toString();
        check = await Teachers.checkExist({ teacher_id });
        cnt = cnt + 1;
        if(!check.success) {
            return modelsError.error(500, "Lỗi hệ thống cấp mã số");
        }
    } while(check.existed && cnt < 1000000);
    if(cnt >= 1000000) {
        return modelsError.error(400, "Quá số giảng viên cho phép");
    }
    return {
        success: true,
        teacher_id: teacher_id,
    }
}

const generateUsername = (fullname, teacher_id) => {
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

    // eliminate GV in teacher ID
    console.log(teacher_id);
    teacher_id = teacher_id.substring(2);
    return username + teacher_id;
}

const createTeacher = async (info) => {

    const resultGeneratingID = await generateTeacherId("GV");
    if(!resultGeneratingID.success) {
        return resultGeneratingID;
    }
    info.teacher_id = resultGeneratingID.teacher_id;
    info.username = generateUsername(info.fullname, info.teacher_id);
    info.password = utils.hash(info.username);
    info.role = "Giảng viên";
    
    const creatingResult = await Teachers.createNewTeacher(info);
    if(creatingResult.success) {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            //   user: 'anhduy8a1vx52412312022004@gmail.com',
            //   pass: 'rqbn psax tpfh yxji'
                user: 'nhantranibm5100@gmail.com',
                pass: 'dtzd zgdx lcrr ieej'
            }
          });
          var mailOptions = {
            from: 'youremail@gmail.com',
            to: info.contact_email,
            subject: 'Reset Password',
            text: 'Tài khoản của bạn được tạo thành công với thông tin người dùng được cung cấp bên dưới'
            + '\nUsername: ' + info.username 
            + '\nPassword: ' + info.username 
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
            message: `Tạo giảng viên mã ${info.teacher_id} thành công!`
        }
    }
    else {
        return modelsError.error(500, createTeacher.error);
    }

}

const getOneTeacher = async(condition) => {
    const result = await Teachers.getOneTeacher(condition);

    if(!result.success) {
        return result;
    }
    return {
        success: true,
        message: 'Truy vấn thông tin giảng viên dùng thành công!',
        data: result.data
    };
}

const getManyTeachers = async(condition) => {
    const result = await Teachers.getManyTeachers(condition);
    if(!result.success) {
        return result;
    }

    return {
        success: true,
        message: 'Truy vấn thông tin tất cả giảng viên thành công!',
        data: result.data
    }
}

const getAllTeachers = async () => {
    const result = await Teachers.getAllTeachers();
    if(!result.success) {
        return result;
    }
    console.log(result);

    return {
        success: true,
        message: 'Truy vấn thông tin tất cả giảng viên thành công!',
        data: result.data
    }
}


const updateInfoTeacher = async(teacher_id, updatingInfo) => {
    const checkExist = await Teachers.checkExist({ teacher_id });

    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && !checkExist.existed) {
        return modelsError.error(404, `Không tìm thấy thông tin giảng viên có mã ${teacher_id}!`);
    }

    const result = await Teachers.updateInfoTeacher(teacher_id , updatingInfo);

    if(!result.success) {
        return modelsError.error(500, result.error);
    }

    return {
        success: true,
        message: `Cập nhật thông tin giảng viên có mã ${teacher_id} thành công!`
    };
}

const deleteTeacher = async(teacher_id) => {
    
    const checkExist = await Teachers.checkExist({ teacher_id });

    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && !checkExist.existed) {
        return modelsError.error(404, `Không tìm thấy thông tin giảng viên có mã ${teacher_id}!`);
    }

    const deletedTeacher = await Teachers.deleteTeacher(teacher_id);

    if(deletedTeacher.success) {
        return {
            success: true,
            message: 'Xóa giảng viên mã ' + teacher_id + ' thành công!'
        };
    }
    else {
        return modelsError(500, deletedTeacher.error);
    }
}

const updatePassword = async(info) => {

    const Teacher = await Teachers.getOneTeacher({ username: info.username });
    if(!Teacher.data || Teacher.data.length === 0) {
        return modelsError.error(404, `Giảng viên có tài khoản ${info.username} không tồn tại!`);
    }

    const match = bcrypt.compareSync(info.password, Teacher.data.password);

    if (!match) {
        return modelsError.error(409, "Mật khẩu không đúng!");
    }

    const updatedField = {
        password: utils.hash(info.new_password)
    }

    const resultUpdatingTeacher = await updateInfoTeacher(Teacher.data.teacher_id, updatedField);
    if(!resultUpdatingTeacher.success) {
        return modelsError.error(500, resultUpdatingTeacher.error);
    }

    return {
        success: true,
        message: `Cập nhật thông tin giảng viên có mã ${Teacher.data.teacher_id} thành công!`
    };

}

const getClasses = async(teacher_id) => {
    const teacher = await Teachers.getOneTeacher({ teacher_id });
    const dbCollection = `teachers/${teacher.data.id}/classes`;
    const result = await Classes.getAllClasses(dbCollection);
    return {
        success: true,
        data: result,
        message: "Truy vấn lớp học cho giảng viên thành công"
    }
}

module.exports = {
    createTeacher, 
    updateInfoTeacher, 
    deleteTeacher,
    getOneTeacher,
    getManyTeachers,
    getAllTeachers,
    updatePassword,
    getClasses
}