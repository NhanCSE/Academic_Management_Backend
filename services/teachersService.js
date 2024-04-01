const Teachers = require("../database/Teachers");
const Students = require("../database/Students");
const modelsError = require("../models/error");

const createTeacher = async (info) => {
    const checkExist = await Teachers.checkExist(info.teacher_id);
    
    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && checkExist.existed) {
        return modelsError.error(404, "Giảng viên đã tồn tại từ trước!")
    }
    
    const creatingResult = await Teachers.createNewTeacher(info);
    if(creatingResult.success) {
        return {
            success: true,
            message: `Tạo giảng viên mã ${info.teacher_id} thành công!`
        }
    } 
    else {
        return modelsError.error(500, createTeacher.error);
    }

}

const getInfoTeacher = async(info)=>{

    if(!info.teacher_id){
        return modelsError.error(404, "Không có mã số giảng viên để lấy thông tin");
    }

    const checkExist = await Teachers.checkExist(info.teacher_id);
    
    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && !checkExist.existed) {
        return modelsError.error(404, "Giảng viên không tồn tại!")
    }
    
    const gettingResult = await Teachers.getInfoTeacher(info.teacher_id);
    if(gettingResult.success) {
        return {
            success: true,
            message: `Lấy thông tin giảng viên mã ${info.teacher_id} thành công!`,
            data: gettingResult.data
        }
    } 
    else {
        return modelsError.error(500, gettingResult.error);
    }
}


module.exports = {
    createTeacher, getInfoTeacher, 
}