const Joi = require("joi");
// const JoiDate = require("@hapi/joi").extend(require("@joi/date"));
const { joiPasswordExtendCore } = require('joi-password') 
const joiPassword = Joi.extend(joiPasswordExtendCore);
// const joiDate = Joi.extend(JoiDate);

class Validation {
    validateCreateCourse = (data) => {
        const schema = Joi.object({
            course_name: Joi.string().required(),
            credits: Joi.number().integer().min(1).required(),
            course_type: Joi.string().required(),
            major: Joi.array().items(Joi.string()).required(),
            faculty: Joi.string().required(),
            course_condition: Joi.array().items(Joi.string().regex(new RegExp(process.env.REGEX_COURSE))),
            student_condition: Joi.number().integer().min(1).required()
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

    validateUpdateCourse = (data) => {
        const schema = Joi.object({
            course_name: Joi.string(),
            credits: Joi.number().min(1),
            course_type: Joi.string(),
            course_condition: Joi.array().items(Joi.string().regex(new RegExp(process.env.REGEX_COURSE))),
            major: Joi.array().items(Joi.string()),
            faculty: Joi.string(),
            student_condition: Joi.number().min(1).max(4)
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

    validateCourseID = (data) => {
        const schema = Joi.object({
            course_id: Joi.string().regex(new RegExp(process.env.REGEX_COURSE)).required()
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
}

module.exports = Validation;
