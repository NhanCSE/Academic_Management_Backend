const studentsService = require("../services/studentsService");
const modelsResponse = require("../models/response");
const utils = require("../lib/utils");

const studentsValidation = require("../validations/studentsValidation");

const validation = new studentsValidation;

//@desc  Create Student
//@route POST /api/v1/student/create
const createStudent = async (req, res) => {
    try {
        console.log(req.user);
        const { error } = validation.validateCreateStudent(req.body);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        console.log(req.user);
        //req.body.password = utils.hash(req.body.password);
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

//@desc  Create Subject
//@route POST /api/v1/students/createSubject

const createSubject = async(req, res) => {
    try {
        const resultCreating = await studentsService.createSubject(req.body);

        if(resultCreating.success) {
            return modelsResponse.response(res, 200, resultCreating.message);
        } 
        else {
            return modelsResponse.response(res, resultCreating.errorStatus, resultCreating.message);
        }
    } catch(error) {
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

//@desc  Register Subject
//@route POST /api/v1/students/registerSubject

const registerSubject = async(req,res) => {
    try {
        const resultRegistering = await studentsService.registerSubject(req);

        if(resultRegistering.success) {
            return modelsResponse.response(res, 200, resultRegistering.message);
        }
        else {
            return modelsResponse.response(res, resultRegistering.errorStatus, resultRegistering.message);
        }
    } catch(error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

module.exports = {
    createStudent,
    createSubject,
    getInfoStudent,
    updateInfoStudent,
    deleteStudent,
    registerSubject
}