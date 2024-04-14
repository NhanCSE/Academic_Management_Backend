const Joi = require("joi");
const { joiPasswordExtendCore } = require('joi-password') 
const joiPassword = Joi.extend(joiPasswordExtendCore);


class Validation {
    validateCreateClass = (data) => {
        const schema = Joi.object({
            course_id: Joi.string().regex(new RegExp(process.env.REGEX_COURSE)).required(),
            program: Joi.string().valid("CQ", "CLC", "CN").required(),
            semester: Joi.string().required(),
            day: Joi.string().valid("Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật").required(),
            max_students: Joi.number().integer().min(1).required(),
            period: Joi.array().items(Joi.number().integer().min(1).max(24)).required(),
            room: Joi.string().required(),
            weeks: Joi.array().items(Joi.number().integer().min(1).max(52)).required()
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);            
    }

    validateUpdateClass = (data) => {
        const schema = Joi.object({
            course_id: Joi.string().regex(new RegExp(process.env.REGEX_COURSE)),
            program: Joi.string().valid("CQ", "CLC", "CN"),
            semester: Joi.string(),
            day: Joi.string().valid("Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"),
            max_students: Joi.number().integer().min(1),
            period: Joi.array().items(Joi.number().integer().min(1).max(24)),
            room: Joi.string(),
            weeks: Joi.array().items(Joi.number().integer().min(1).max(52))
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);            
    }

    validateRegisterClass = (data) => {
        const schema = Joi.object({
            course_id: Joi.string().regex(new RegExp(process.env.REGEX_COURSE)).required(),
            class_id: Joi.string().regex(new RegExp(process.env.REGEX_CLASS_COURSE)).required()
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);            
    }

    validateClassID = (data) => {
        const schema = Joi.object({
            class_id: Joi.string().regex(new RegExp(process.env.REGEX_CLASS_COURSE)).required()
        }).strict();
        return schema.validate(data);
    }

    validateUpdateScore = (data) => {
        const schema = Joi.object({
            student_id: Joi.string().regex(new RegExp(process.env.REGEX_STUDENT_ID)).required(),
            midterm: Joi.number().min(0).required(),
            final: Joi.number().min(0).required(),
            lab: Joi.number().min(0).required(),
            exercise: Joi.number().min(0).required(),
        }).strict();
        return schema.validate(data);
    }
}

module.exports = Validation;
