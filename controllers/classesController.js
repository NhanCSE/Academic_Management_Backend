const coursesService = require("../services/coursesService");
const classesService = require("../services/classesService");
const modelsResponse = require("../models/response");
const classesValidation = require("../validations/classesValidation");

const validation = new classesValidation;

const createClass = async (req, res) => {
    try {
        const { error } = validation.validateCreateClass(req.body);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        const resultCreating = await classesService.createClass(req.body);
        if(!resultCreating.success) {
            return modelsResponse.response(res, resultCreating.errorStatus, resultCreating.message);
        }
        return modelsResponse.response(res, 200, resultCreating.message);
    } catch (error) {
        console.log(error.message);
        return modelsResponse.response(res, 500, error.message);
    }
}

const registerClass = async (req, res) => {
    try{
        const { error } = validation.validateRegisterClass(req.body);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        if(req.user.role === "Sinh viên") {
            const resultRegisterClass = await classesService.registerClassForStudent(req.body, req.user.student_id);
            if(resultRegisterClass.success) {
                return modelsResponse.response(res, 200, resultRegisterClass.message);
            }
            else {
                return modelsResponse.response(res, resultRegisterClass.errorStatus, resultRegisterClass.message);
            }
        } else if (req.user.role === "Giảng viên") {
            const resultRegisterClass = await classesService.registerClassForTeacher(req.body, req.user.teacher_id);
            if(resultRegisterClass.success) {
                return modelsResponse.response(res, 200, resultRegisterClass.message);
            }
            else {
                return modelsResponse.response(res, resultRegisterClass.errorStatus, resultRegisterClass.message);
            }
        }
        
    } catch (error) {
        console.log("Error appear hear", error.message);
        return modelsResponse.response(res, 500, error.message);
    }
}

const updateScore =  async (req, res) => {
    try{
        const { error } = validation.validateUpdateScore(req.body);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        const resultUpdateScore = await classesService.updateScore(req.body, req.query.class_id, req.user.teacher_id);
        if(!resultUpdateScore.success) {
            return modelsResponse.response(res, resultUpdateScore.errorStatus, resultUpdateScore.message);
        }
        return modelsResponse.response(res, 200, resultUpdateScore.message);
        
    } catch (error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

const cancelRegisterClass = async (req, res) => {
    try{
        const { error } = validation.validateRegisterClass(req.body);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        if(req.user.role === "Sinh viên") {
            const resultCancelRegister = await classesService.cancelRegisterForStudent(req.body, req.user.student_id);
            if(!resultCancelRegister.success) {
                return modelsResponse.response(res, resultCancelRegister.errorStatus, resultCancelRegister.message);
            }
            return modelsResponse.response(res, 200, resultCancelRegister.message);
        } else if(req.user.role === "Giảng viên") {
            const resultCancelRegister = await classesService.cancelRegisterForTeacher(req.body, req.user.teacher_id);
            if(!resultCancelRegister.success) {
                return modelsResponse.response(res, resultCancelRegister.errorStatus, resultCancelRegister.message);
            }
            return modelsResponse.response(res, 200, resultCancelRegister.message);
        }
        
    } catch (error) {
        return modelsResponse.response(res, 500, error.message);
    }
}


module.exports = {
    createClass,
    registerClass,
    updateScore,
    cancelRegisterClass
}