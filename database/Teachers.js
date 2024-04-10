const db = require("../firebase/firebaseConnection");
const teachersRef = db.collection("teachers");
const dbUtils = require("../lib/dbUtils");
//const studentsRef = db.collection("students");


const checkExist = async (condition) => {
    const conditionFields = Object.keys(condition);
    const conditionValues = Object.values(condition);
    return await dbUtils.checkExist("teachers", conditionFields, conditionValues);
};

//CHỈ QUẢN TRỊ VIÊN TẠO MỚI ĐƯỢC GIẢNG VIÊN
const createNewTeacher = async (info) => {
    try {    
        const docRef = await teachersRef.add(info);
        return {
            success: true,
        };
        
    } catch (error) {
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
}


const getOneTeacher = async(condition) => {
    try {
        const conditionFields = Object.keys(condition);
        const conditionValues = Object.values(condition);
        const result = await dbUtils.findIntersect("teachers", conditionFields, conditionValues);
        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
    }
}

const getManyTeachers = async(condition) => {
    try {
        const conditionFields = Object.keys(condition);
        const conditionValues = Object.values(condition);
        const result = await dbUtils.findUnion("teachers", conditionFields, conditionValues);
        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
    }
}

//ADMIN LẤY ĐƯỢC TẤT CẢ THÔNG TIN GIẢNG VIÊN
const getAllTeachers = async() => {
    try{
        const result = await dbUtils.findAll("teachers");
        return {
            success: true,
            data: result
        }
    }
    catch{
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

//CẬP NHẬT THÔNG TIN
const updateInfoTeacher = async(teacher_id, updatingInfo) => {
    return await dbUtils.updateOne("teachers", ["teacher_id"], [teacher_id], updatingInfo);
}


//CHỈ ADMIN MỚI ĐƯỢC XÓA
const deleteTeacher = async(teacher_id) => {
    return dbUtils.deleteOne("teachers", ["teacher_id"], [teacher_id]);
}


module.exports = {
    checkExist,
    createNewTeacher,
    getAllTeachers,
    getManyTeachers,
    updateInfoTeacher,
    deleteTeacher,
    getOneTeacher
}