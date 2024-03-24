const studentsService = require("../services/studentsService");
const modelsResponse = require("../models/response");
const createStudent = async (req, res) => {
    //Validation and Authorization Part will sooner release
    try {
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