const studentsService = require("../services/studentsService");
const modelsResponse = require("../models/response");
const utils = require("../lib/utils");

//@desc  Create Student
//@route POST /api/v1/student/create
const createStudent = async (req, res) => {
    //Validation and Authorization Part will sooner release
    try {
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
        const resultGetting = await studentsService.getInfoStudent(req);

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

//@desc  Get Students
//@route GET /api/v1/students/getAllStudents

const getAllStudents = async(req, res) => {
    try {
        const resultGetting = await studentsService.getAllStudents(req);

        if(resultGetting.success) {
            return modelsResponse.response(res, 200, resultGetting.message, resultGetting.data);
        }
        else {
            return modelsResponse.response(res, resultGetting.errorStatus, resultGetting.message);
        }
    } catch(error){
        return modelsResponse.response(res, 500, error.message);
    }
}

//@desc  Update Student
//@route PUT /api/v1/students/updateInfoStudent

const updateInfoStudent = async(req, res) => {
    try {
        const resultUpdating = await studentsService.updateInfoStudent(req);

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
        const resultDeleting = await studentsService.deleteStudent(req);

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
    getAllStudents,
    deleteStudent,
    registerSubject
}