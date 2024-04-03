const teachersService = require("../services/teachersService");
const modelsResponse = require("../models/response");
const createTeacher = async (req, res) => {
    //Validation and Authorization Part will sooner release
    try {
        const resultCreating = await teachersService.createTeacher(req);  
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
        const resultGetting = await teachersService.getInfoTeacher(req);
        
        if(resultGetting.success) {
            return modelsResponse.response(res, 200, resultGetting.message, resultGetting.data);
        } else {
            return modelsResponse.response(res, resultGetting.errorStatus, resultGetting.message);
        }
    } catch (error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

const getAllTeacher = async(req, res)=>{
    try {
        const resultGetting = await teachersService.getAllTeacher(req);
        
        if(resultGetting.success) {
            return modelsResponse.response(res, 200, resultGetting.message, resultGetting.data);
        } else {
            return modelsResponse.response(res, resultGetting.errorStatus, resultGetting.message);
        }
    } catch (error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

const updateInfoTeacher = async(req, res)=>{
    try {
        const resultUpdating = await teachersService.updateInfoTeacher(req);
        
        if(resultUpdating.success) {
            return modelsResponse.response(res, 200, resultUpdating.message, resultUpdating.data);
        } else {
            return modelsResponse.response(res, resultUpdating.errorStatus, resultUpdating.message);
        }
    } catch (error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

const deleteTeacher = async(req,res)=>{
    try {
        const resultDeleting = await teachersService.deleteTeacher(req);
        
        if(resultDeleting.success) {
            return modelsResponse.response(res, 200, resultDeleting.message, resultDeleting.data);
        } else {
            return modelsResponse.response(res, resultDeleting.errorStatus, resultDeleting.message);
        }
    } catch (error) {
        return modelsResponse.response(res, 500, error.message);
    }
}


module.exports = {
    createTeacher, getInfoTeacher, getAllTeacher, updateInfoTeacher, deleteTeacher,
}