const teachersService = require("../services/teachersService");
const modelsResponse = require("../models/response");
const createTeacher = async (req, res) => {
    //Validation and Authorization Part will sooner release
    try {
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

const getInfoTeacher = async(req, res)=>{
    try {
        const resultGetting = await teachersService.getInfoTeacher(req.body);
        
        if(resultGetting.success) {
            return modelsResponse.response(res, 200, resultGetting.message, resultGetting.data);
        } else {
            return modelsResponse.response(res, resultGetting.errorStatus, resultGetting.message);
        }
    } catch (error) {
        return modelsResponse.response(res, 500, error.message);
    }
}


module.exports = {
    createTeacher, getInfoTeacher,
}