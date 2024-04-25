const Admins = require("../database/Admins");
const modelsError = require("../models/error");

//Tạo admin 
//B1: check xem admin_id có tồn tại chưa? Có => báo đã tồn tại
//B2: cập nhật field role và active\
//B3: Tạo admin mới trong db
const createAdmin = async (info) => {
    //B1
    const checkExist = await Admins.checkExist(info.admin_id);
    if(!checkExist.success) {
        return modelsError.error(404, checkExist.error);
    }
    if(checkExist.success && checkExist.existed) {
        return modelsError.error(404, "Quản trị viên đã tồn tại từ trước!")
    }
    //B2
    info.role = "Quản trị viên";
    info.active = 1;
    //B3
    const creatingResult = await Admins.createNewAdmin(info);
    if(creatingResult.success) {
        return {
            success: true,
            message: `Tạo quản trị viên mã ${info.admin_id} thành công!`
        }
    } 
    else {
        return modelsError.error(500, createAdmin.error);
    }

}

module.exports = {
    createAdmin,
}