const Admins = require("../database/Admins");
const modelsError = require("../models/error");

const createAdmin = async (info) => {
    const checkExist = await Admins.checkExist(info.admin_id);
    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && checkExist.existed) {
        return modelsError.error(404, "Sinh viên đã tồn tại từ trước!")
    }
    
    const creatingResult = await Admins.createNewAdmin(info);
    if(creatingResult.success) {
        return {
            success: true,
            message: `Tạo sinh viên mã ${info.admin_id} thành công!`
        }
    } 
    else {
        return modelsError.error(500, createAdmin.error);
    }

}

module.exports = {
    createAdmin,
}