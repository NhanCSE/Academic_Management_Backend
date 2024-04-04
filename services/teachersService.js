const Teachers = require("../database/Teachers");
//const Students = require("../database/Students");
const modelsError = require("../models/error");

const createTeacher = async (req) => {

    if(!req.body.teacher_id){
        return modelsError.error(404, "Không có mã số giảng viên để tạo mới");
    }

    const checkExist = await Teachers.checkExist(req.body.teacher_id);
    
    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && checkExist.existed) {
        return modelsError.error(404, "Giảng viên đã tồn tại từ trước!")
    }
    
    const creatingResult = await Teachers.createNewTeacher(req);
    if(creatingResult.success) {
        return {
            success: true,
            message: `Tạo giảng viên mã ${req.body.teacher_id} thành công!`
        }
    } 
    else {
        return modelsError.error(500, createTeacher.error);
    }

}

const getInfoTeacher = async(req)=>{

    if(!req.body.teacher_id){
        return modelsError.error(404, "Không có mã số giảng viên để lấy thông tin");
    }

    const checkExist = await Teachers.checkExist(req.body.teacher_id);
    
    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && !checkExist.existed) {
        return modelsError.error(404, "Giảng viên không tồn tại!")
    }
    
    const gettingResult = await Teachers.getInfoTeacher(req);
    if(gettingResult.success) {
        return {
            success: true,
            message: `Lấy thông tin giảng viên mã ${req.body.teacher_id} thành công!`,
            data: gettingResult.data
        }
    } 
    else {
        return modelsError.error(500, gettingResult.error);
    }
}

const getAllTeacher = async(req)=>{

    const gettingResult = await Teachers.getAllTeacher(req);
    if(gettingResult.success) {
        return {
            success: true,
            message: `Lấy thông tin tất cả giảng viên thành công!`,
            data: gettingResult.data
        }
    }
    else {
        return modelsError.error(500, gettingResult.error);
    }
}


const updateInfoTeacher = async (req) => {

    if(!req.body.teacher_id){
        return modelsError.error(404, "Không có mã số giảng viên để cập nhật thông tin");
    }

    const checkExist = await Teachers.checkExist(req.body.teacher_id);
    
    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && !checkExist.existed) {
        return modelsError.error(404, "Giảng viên không tồn tại!")
    }
    
    const updatingResult = await Teachers.updateInfoTeacher(req);
    if(updatingResult.success) {
        return {
            success: true,
            message: `Cập nhật thông tin giảng viên mã ${req.body.teacher_id} thành công!`,
        }
    }
    else {
        return modelsError.error(500, updateInfoTeacher.error);
    }
}

const deleteTeacher = async (req) => {

    if(!info.teacher_id){
        return modelsError.error(404, "Không có mã số giảng viên để xóa thông tin");
    }

    const checkExist = await Teachers.checkExist(req.body.teacher_id);
    
    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && !checkExist.existed) {
        return modelsError.error(404, "Giảng viên không tồn tại!")
    }
    
    const deletingResult = await Teachers.deleteTeacher(req);
    if(deletingResult.success) {
        return {
            success: true,
            message: `Xóa thông giảng viên mã ${req.body.teacher_id} thành công!`,
        }
    }
    else {
        return modelsError.error(500, deleteTeacher.error);
    }
}

module.exports = {
    createTeacher, getInfoTeacher, getAllTeacher, updateInfoTeacher, deleteTeacher,
}