const adminsService = require("../services/adminsService");
const modelsResponse = require("../models/response");
const utils = require("../lib/utils");
const adminsValidation = require("../validations/adminsValidation");

const validation = new adminsValidation;

const createAdmin = async (req, res) => {
    //Validation and Authorization Part will sooner release
    try {
        const { error } = validation.validateCreateAdmin(req.body);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }

        req.body.password = utils.hash(req.body.password);
        const resultCreating = await adminsService.createAdmin(req.body);
        
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
    createAdmin,
}