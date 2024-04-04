const studentsService = require("../services/studentsService");
const modelsResponse = require("../models/response");
const utils = require("../lib/utils");
const studentsValidation = require("../validations/studentsValidation");

const validation = new studentsValidation;

const createStudent = async (req, res) => {
    try {
    
        const { error } = validation.validateCreateStudent(req.body);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }

        req.body.password = utils.hash(req.body.password);
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

module.exports = {
    createStudent,
}