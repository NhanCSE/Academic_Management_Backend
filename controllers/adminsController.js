const adminsService = require("../services/adminsService");
const modelsResponse = require("../models/response");
const utils = require("../lib/utils");
const adminsValidation = require("../validations/adminsValidation");

const validation = new adminsValidation;

//Tạo admin
//b1: xác thực THÔNG TIN CỦA REQ
//b2: tạo password vào db bằng pp hash
//b3: tạo admin dưới service
const createAdmin = async (req, res) => {
    try {
        //b1
        const { error } = validation.validateCreateAdmin(req.body);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        //b2
        req.body.password = utils.hash(req.body.password);
        const resultCreating = await adminsService.createAdmin(req.body);
        //b3
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