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


const submitFile = async (req, res) => {
    try {
        const { error } = validation.validateClassID(req.query);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }

        if (!req.file) {
            return modelsResponse.response(res, 400, "Không có file gửi lên");
        }
    
        const resultSubmitFile = await classesService.submitFile(req.file, req.query.class_id, req.user.student_id);
        if(!resultSubmitFile.success) {
            return modelsResponse.response(res, resultSubmitFile.errorStatus, resultSubmitFile.message);
        }

        return modelsResponse.response(res, 200, "Nộp file thành công");
    } catch (error) {
        console.log(error);
        return modelsResponse.response(res, 500, error.message)
    }    
}

const getSubmitFiles = async (req, res) => {

    try {
        const { error } = validation.validateClassID(req.query);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }

        let prefix;
        if(req.user.role === "Giảng viên") {
            prefix = req.query.class_id; 
        } 
        else if (req.user.role === "Sinh viên") {
            prefix = req.query.class_id + "_" + req.user.student_id; 
        }
        const { passThroughStream } = await classesService.getSubmitFiles(prefix);
        // Set response headers for zip file download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${prefix}_files.zip"`);

        // Pipe the pass-through stream to the response
        passThroughStream.pipe(res); 
    } catch (error) {
        console.error('Error downloading files:', error.message);
        return modelsResponse.response(res, 500, "Lỗi tải file");
    }

}

const deleteSubmitFile = async (req, res) => {
    try{
        // Define the name of the file you want to delete
        const fileName = req.query.filename; // Replace with the name of the file you want to delete
        await classesService.deleteSubmitFile(fileName);

        return modelsResponse.response(res, 200, "Xóa file thành công");
    } catch (error) {
        return modelsResponse.response(res, 500, error.message);
    }
}

const showSubmitFile = async (req, res) => {
    try {
        const { error } = validation.validateClassID(req.query);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
        if(req.user.role === "Giảng viên") {
            const resultShowingSubmitFile = await classesService.showSubmitFileForTeacher(req.query.class_id);
            if(!resultShowingSubmitFile.success) {
                return modelsResponse.response(res, resultShowingSubmitFile.errorStatus, resultShowingSubmitFile.message);
            }
            return modelsResponse.response(res, 200, "Lấy file nộp thành công", resultShowingSubmitFile.data);
        } 
        else if (req.user.role === "Sinh viên") {
            
            const resultShowingSubmitFile = await classesService.showSubmitFileForStudent(req.query.class_id, req.user.student_id);
            if(!resultShowingSubmitFile.success) {
                return modelsResponse.response(res, 500, "Lỗi lấy file")
            }
            return modelsResponse.response(res, 200, "Lấy file nộp thành công", resultShowingSubmitFile.data);
        
        }  
    } catch (error) {
        console.error('Error downloading files:', error);
        return modelsResponse.response(res, 500, "Lỗi tải file");
    } 
}

const getScoreByTeacher = async(req, res) => {
    try {
        const { error } = validation.validateClassID(req.query);
        if(error) {
            return modelsResponse.response(res, 400, error.message);
        }
    
        const getResult = await classesService.getScoreByTeacher(req.query.class_id, req.user.teacher_id);
        if(!getResult.success) {
            return modelsResponse.response(res, getResult.errorStatus, getResult.message);
        }

        return modelsResponse.response(res, 200, getResult.message, getResult.data);
    } catch (error) {
        console.log(error);
        return modelsResponse.response(res, 500, error.message)
    }    
}
module.exports = {
    createClass,
    registerClass,
    updateScore,
    cancelRegisterClass,
    submitFile,
    getSubmitFiles,
    deleteSubmitFile,
    showSubmitFile,
    getScoreByTeacher
}