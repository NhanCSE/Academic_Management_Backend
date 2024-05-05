const studentsService = require("../services/studentsService");
const modelsResponse = require("../models/response");
const utils = require("../lib/utils");
const fs = require("fs");
const path = require("path");
const studentsValidation = require("../validations/studentsValidation");

const validation = new studentsValidation;

//@desc  Create Student
//@route POST /api/v1/student/create
const createStudent = async (req, res) => {
    try {
        const { error } = validation.validateCreateStudent(req.body);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }

        const resultCreating = await studentsService.createStudent(req.body);
        
        if(resultCreating.success) {
            return modelsResponse.response(res, 200, resultCreating.message);
        } else {
            return modelsResponse.response(res, resultCreating.errorStatus, resultCreating.message);
        }
    } catch (error) {
        return modelsResponse.response(res, 500, error.message);
    }
    
}

//@desc  Get Student
//@route GET /api/v1/students/getInfoStudent
const getInfoStudent = async(req, res) => {
    try {
        console.log(req.user);
        let resultGetting;
        if(req.user.role === "Sinh viên") {
            resultGetting = await studentsService.getOneStudent({ student_id: req.user.student_id });
            // Check if the document has a password field before removing it
            if (resultGetting.data.hasOwnProperty('password')) {
                delete resultGetting.data.password; // Remove the password field
            }
        } 
        else if(req.user.role === "Quản trị viên") {
            
            if(!req.body || Object.keys(req.body).length === 0) {         
                resultGetting = await studentsService.getAllStudents();
            }
            else {
                resultGetting = await studentsService.getManyStudents(req.body);
            }
            if(!resultGetting.data) {
                return modelsResponse.response(res, 404, "Không có sinh viên cần tìm");
            }
            if(!resultGetting.data.length) {
                if(resultGetting.data.hasOwnProperty("password")) {
                    delete resultGetting.data.password;
                }
            }
            if(resultGetting.data.length > 0) {
                resultGetting.data.forEach(element => {
                    if (element.hasOwnProperty('password')) {
                        delete element.password; // Remove the password field
                    }
                });
            }
        }
        if(resultGetting.success) {
            return modelsResponse.response(res, 200, resultGetting.message, resultGetting.data);
        }
        else {
            return modelsResponse.response(res, resultGetting.errorStatus, resultGetting.message);
        }
    } catch(error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

//@desc  Update Student
//@route PUT /api/v1/students/updateInfoStudent
const updateInfoStudent = async(req, res) => {
    try {
        const { error: conditionError } = validation.validateStudentID(req.query);
        if(conditionError) {
            return modelsResponse.response(res, 400, conditionError.message);
        }
        if(req.user.role === "Sinh viên") {
            if(req.user.student_id !== req.query.student_id) {
                return modelsResponse.response(res, 403, "Sinh viên không có quyền thay đổi thông tin của sinh viên khác!");
            }
            const { error: infoError } = validation.validateUpdateStudentByStudent(req.body);
            if(infoError) {
                return modelsResponse.response(res, 400, infoError.message);
            }

        } else if(req.user.role === "Quản trị viên") {
            const { error } = validation.validateUpdateStudentByAdmin(req.body);
            if(error) {
                return modelsResponse.response(res, 400, error.message);
            }

            if(req.body.hasOwnProperty("password")) {
                req.body.password = utils.hash(req.body.password);
            }
        }
        const resultUpdating = await studentsService.updateInfoStudent(req.query.student_id, req.body);

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

//@desc  Delete Student
//@route DELETE /api/v1/students/deleteStudent

const deleteStudent = async(req, res) => {
    try {
        const { error } = validation.validateStudentID(req.query);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        const resultDeleting = await studentsService.deleteStudent(req.query.student_id);

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


const getClasses = async(req, res) => {
    try {
        const resultGetting = await studentsService.getClasses(req.user.student_id);
        
        if(resultGetting.success) {
            return modelsResponse.response(res, 200, resultGetting.message, resultGetting.data);
        }
        else {
            return modelsResponse.response(res, resultGetting.errorStatus, resultGetting.message);
        }
    } catch(error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

const updatePassword = async(req, res) => {
    try {
        const { error } = validation.validateUpdatePassword(req.body);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        const resultUpdatingPassword = await studentsService.updatePassword(req.body);

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

const createStudentsByFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(404).json({
                error: true,
                message: "File không tồn tại.",
            });
        }

        const folderPath = path.join("storage", "students_document", "students_temp");
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        
        const filePath = path.join(folderPath, req.file.filename);
        if (!fs.existsSync(filePath)) {
            return modelsResponse.response(res, 404, "Không tìm thấy file!");
        }

        const resultCheckingFileFormat = await studentsService.checkFileFormat(filePath.toString());
        if (!resultCheckingFileFormat.valid) {
            return modelsResponse.response(res, 400, resultCheckingFileFormat.message);
        }

        const students = await studentsService.getStudentsFromFile(filePath.toString());
        
        let successNumber = 0;
        const successArray = new Array();
        let failNumber = 0;
        const failArray = new Array();
        
        for (const student of students) {

            const resultCreatingNewOrder = await studentsService.createStudent(student);
            if (!resultCreatingNewOrder.success) {
                failNumber++;
                failArray.push(student.credential_id);
            }
            else {
                successNumber++;
                successArray.push(student.credential_id);
            }
        }

        fs.unlinkSync(filePath);
        const responeData = new Object({
            successNumber,
            successArray,
            failNumber,
            failArray,
        });

        return modelsResponse.response(res, 201, `Tạo sinh viên từ file ${req.file.filename} thành công!`, responeData);
    } catch (error) {
        console.log(error);
        return modelsResponse.response(res, 500, error.message);
    }
}

const getScore = async (req, res) => {
    try {
        const { error } = validation.validateStudentID({ student_id : req.user.student_id });
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }

        const resultGettingScore = await studentsService.getScore(req.user.student_id);

        if(resultGettingScore.success) {
            return modelsResponse.response(res, 200, resultGettingScore.message, resultGettingScore.data);
        }
        else {
            return modelsResponse.response(res, resultGettingScore.errorStatus, resultGettingScore.message);
        }
    } catch(error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

module.exports = {
    createStudent,
    getInfoStudent,
    updateInfoStudent,
    deleteStudent,
    updatePassword,
    createStudentsByFile,
    getClasses,
    updatePassword,
    getScore
}