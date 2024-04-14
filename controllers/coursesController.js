const coursesService = require("../services/coursesService");
const modelsResponse = require("../models/response");
const coursesValidation = require("../validations/coursesValidation");

const validation = new coursesValidation;
const createCourse = async (req, res) => {
    try {
        const { error } = validation.validateCreateCourse(req.body);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        const resultCreating = await coursesService.createCourse(req.body);  
        if(resultCreating.success) {
            return modelsResponse.response(res, 200, resultCreating.message);
        } else {
            return modelsResponse.response(res, resultCreating.errorStatus, resultCreating.message);
        }
    } catch (error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

const getInfoCourse = async (req, res) => {
    try {
        const { error } = validation.validateUpdateCourse(req.body);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        let resultGetting;
        if(!req.body || Object.keys(req.body).length === 0) {
            resultGetting = await coursesService.getAllCourses();
        } else {
            resultGetting = await coursesService.getManyCourses(req.body);
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

const updateCourse = async(req, res) => {
    try {
        const { error: infoError } = validation.validateUpdateCourse(req.body);
        if(infoError) {
            return modelsResponse.response(res, 400, infoError.message);
        }

        const { error: conditionError } = validation.validateCourseID(req.query);
        if(conditionError) {
            return modelsResponse.response(res, 400, conditionError.message);
        }
        const resultUpdating = await coursesService.updateCourse(req.query.course_id, req.body);

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

const deleteCourse = async(req, res) => {
    try {
        const { error } = validation.validateCourseID(req.query);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        const resultDeleting = await coursesService.deleteCourse(req.query.course_id);

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

const getAllClassesInCourse = async (req, res) => {
    try {
        const { error } = validation.validateCourseID(req.query);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        const resultGettingAllClass = await coursesService.getAllClassesInCourse(req.query.course_id);
        return modelsResponse.response(res, 200, resultGettingAllClass.message, resultGettingAllClass);
    } catch(error) {
        console.log(error.message);
        return modelsResponse.response(res, 500, error.message);
    }
}

module.exports = {
    createCourse,
    getInfoCourse,
    updateCourse,
    deleteCourse,
    getAllClassesInCourse
}