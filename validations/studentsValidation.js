const Joi = require("joi");
// const JoiDate = require("@hapi/joi").extend(require("@joi/date"));
const { joiPasswordExtendCore } = require('joi-password') 
const joiPassword = Joi.extend(joiPasswordExtendCore);
// const joiDate = Joi.extend(JoiDate);

class Validation {
    validateCreateStudent = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().regex(new RegExp(process.env.REGEX_NAME)).required(),
            gender: Joi.string().valid("Nam", "Nữ").required(),
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)).required(),
            credential_id: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).required(),
            contact_email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)).required(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            address: Joi.string().required(),
            class: Joi.string().regex(new RegExp(process.env.REGEX_CLASSROOM)).required(),
            level: Joi.string().valid("Đại học", "Cao học").required(),
            program: Joi.string().valid("CQ", "CLC", "VHVL").required(),
            faculty: Joi.string().required(),            
            major: Joi.string().required()
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

    validateUpdateStudentByStudent = (data) => {
        const schema = Joi.object({
            contact_email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            address: Joi.string(),
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

    validateUpdateStudentByAdmin = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().regex(new RegExp(process.env.REGEX_NAME)).required(),
            gender: Joi.string().valid("Nam", "Nữ").required(),
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)).required(),
            credential_id: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).required(),
            contact_email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)).required(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            address: Joi.string().required(),
            class: Joi.string().regex(new RegExp(process.env.REGEX_CLASSROOM)).required(),
            level: Joi.string().valid("Đại học", "Cao học").required(),
            program: Joi.string().valid("CQ", "CLC", "VHVL").required(),
            faculty: Joi.string().required(),            
            major: Joi.string().required()
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

    validateStudentID = (data) => {
        const schema = Joi.object({
            student_id: Joi.string().regex(new RegExp(process.env.REGEX_STUDENT_ID)).required()
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
