const teachersService = require("../services/teachersService");
const modelsResponse = require("../models/response");
const teacherValidation = require("../validations/teachersValidation");
const validation = new teacherValidation();

//HÀM TẠO GIẢNG VIÊN
//b1: Xác thực thông tin của req có hợp lệ ko
//B2: tạo gV ở service với các trường trong req.body
const createTeacher = async (req, res) => {
    try {
        const { error } = validation.validateCreateTeacher(req.body);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        const resultCreating = await teachersService.createTeacher(req.body);  
        if(resultCreating.success) {
            return modelsResponse.response(res, 200, resultCreating.message);
        } else {
            return modelsResponse.response(res, resultCreating.errorStatus, resultCreating.message);
        }
    } catch (error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

//HÀM LẤY THÔNG TIN CỦA GIẢNG VIÊN
//nếu user.role là Admin, nếu req.body = null => lấy all Giảng viên, ngược lại lấy số giảng viên được chỉ định bằng teacher_id
//nếu user.role là GV, thì lấy thông tin của chính GV đó.
//Lưu ý khi lấy thông tin thì KHÔNG lấy trường password
const getInfoTeacher = async(req, res)=>{
    try {
        let resultGetting;
        if(req.user.role === "Quản trị viên") {
            if(!req.body || Object.keys(req.body).length === 0) {
                resultGetting = await teachersService.getAllTeachers();
            } else {
                resultGetting = await teachersService.getManyTeachers(req.body);
            }
            if(resultGetting.data.length > 0) {
                resultGetting.data.forEach(element => {
                    if (element.hasOwnProperty('password')) {
                        delete element.password; // Remove the password field
                    }
                });
            }
        } else if(req.user.role === "Giảng viên") {
            resultGetting = await teachersService.getOneTeacher({ teacher_id: req.user.teacher_id });
            // Check if the document has a password field before removing it
            if (resultGetting.data.hasOwnProperty('password')) {
                delete resultGetting.data.password; // Remove the password field
            }
        }
        
        if(resultGetting.success) {
            return modelsResponse.response(res, 200, resultGetting.message, resultGetting.data);
        } else {
            return modelsResponse.response(res, resultGetting.errorStatus, resultGetting.message);
        }
    } catch (error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

//HÀM CẬP NHẬT THÔNG TIN GIẢNG VIÊN
//B1: xác thực teacher_id
//B2: Nếu user là Giảng viên => Chỉ được quyền thay đổi thông tin của bản thân
// nếu user là QTV => Được thay đổi thông tin
//Nếu thông tin cập nhật có trường password thì phải hash
//B3: Cập nhật thông tin ở service
const updateInfoTeacher = async(req, res) => {
    try {
        const { error: conditionError } = validation.validateTeacherID(req.query);
        if(conditionError) {
            return modelsResponse.response(res, 400, conditionError.message);
        }
        if(req.user.role === "Giảng viên") {
            if(req.user.teacher_id !== req.query.teacher_id) {
                return modelsResponse.response(res, 403, "Giảng viên không có quyền thay đổi thông tin của giảng viên khác!");
            }
            const { error: infoError } = validation.validateUpdateTeacherByTeacher(req.body);
            if(infoError) {
                return modelsResponse.response(res, 400, infoError.message);
            }

        } else if(req.user.role === "Quản trị viên") {
            const { error } = validation.validateUpdateTeacherByAdmin(req.body);
            if(error) {
                return modelsResponse.response(res, 400, error.message);
            }

            if(req.body.hasOwnProperty("password")) {
                req.body.password = utils.hash(req.body.password);
            }
        }
        const resultUpdating = await teachersService.updateInfoTeacher(req.query.teacher_id, req.body);

        if(resultUpdating.success) {
            return modelsResponse.response(res, 200, resultUpdating.message);
        }
        else {
            return modelsResponse.response(res, resultUpdating.errorStatus, resultUpdating.message);
        }
    } catch(error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

//Hàm xóa
//B1: Xác thực đầu vào
//B2: Xóa ở service
const deleteTeacher = async(req, res) => {
    try {
        const { error } = validation.validateTeacherID(req.query);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        const resultDeleting = await teachersService.deleteTeacher(req.query.teacher_id);

        if(resultDeleting.success) {
            return modelsResponse.response(res, 200, resultDeleting.message);
        }
        else {
            return modelsResponse.response(res, resultDeleting.errorStatus, resultDeleting.message);
        }
    } catch(error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

//Hàm cập nhật mật khẩu
//B1: Xác thực đầu vào
//B2: Cập nhật mk ở service
const updatePassword = async(req, res) => {
    try {
        const { error } = validation.validateUpdatePassword(req.body);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        const resultUpdatingPassword = await teachersService.updatePassword(req.body);

        if(resultUpdatingPassword.success) {
            return modelsResponse.response(res, 200, resultUpdatingPassword.message);
        }
        else {
            return modelsResponse.response(res, resultUpdatingPassword.errorStatus, resultUpdatingPassword.message);
        }
    } catch (error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

//Hàm lấy thông tin lớp của GV
const getClasses = async (req, res) => {
    try {
        const resultGettingClasses = await teachersService.getClasses(req.user.teacher_id);
        if(!resultGettingClasses.success) {
            return resultGettingClasses;
        }
        return modelsResponse.response(res, 200, resultGettingClasses.message, resultGettingClasses.data);
    } catch (error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

module.exports = {
    createTeacher, 
    getInfoTeacher, 
    updateInfoTeacher, 
    deleteTeacher,
    updatePassword,
    getClasses
}