const { database: db } = require("../firebase/firebaseConnection");
const dbUtils = require("../lib/dbUtils");
const studentsRef = db.collection("students");
const coursesRef = db.collection("courses")
const modelsError = require("../models/error");

const checkExist = async (condition) => {
    const conditionFields = Object.keys(condition);
    const conditionValues = Object.values(condition);
    return await dbUtils.checkExist("students", conditionFields, conditionValues);
};


const createNewStudent = async (info) => {
    try {
        const docRef = await studentsRef.add(info);
              
        return {
            success: true,
        };
    } catch (error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
    }
}
const createNewSubject = async(info) => {
    try {
        await coursesRef.add(info);
        return {
            success: true
        };
    } catch (error) {
        console.error(error.message)
        return {
            success: false,
            error: error.message
        };
    }
}

//Cập nhật thông tin sinh viên đối với Sinh viên và Quản trị viên
const updateInfoStudent = async(student_id, updatingInfo) => {
    return await dbUtils.updateOne("students", ["student_id"], [student_id], updatingInfo);
}

// 
const deleteStudent = async(student_id) => {
   return await dbUtils.deleteOne("students", ["student_id"], [student_id]);
}

const getOneStudent = async (condition) => {
    try {
        const conditionFields = Object.keys(condition);
        const conditionValues = Object.values(condition);
        const result = await dbUtils.findIntersect("students", conditionFields, conditionValues);
        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
    }
}

const getManyStudents = async (condition) => {
    try {
        const conditionFields = Object.keys(condition);
        const conditionValues = Object.values(condition);
        const result =  await dbUtils.findUnion("students", conditionFields, conditionValues);
        
        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
    } 
}

const getAllStudents = async () => {
    try {
        const result = await dbUtils.findAll("students");
        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
    } 
}
module.exports = {
    createNewStudent,
    checkExist,
    createNewStudent,
    createNewSubject,
    updateInfoStudent,
    deleteStudent,
    getOneStudent,
    getManyStudents,
    getAllStudents,
    
}