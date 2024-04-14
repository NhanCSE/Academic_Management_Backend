const db = require("../firebase/firebaseConnection");
const coursesRef = db.collection("courses");
const dbUtils = require("../lib/dbUtils");

const checkExist = async (condition) => {
    const conditionFields = Object.keys(condition);
    const conditionValues = Object.values(condition);
    return await dbUtils.checkExist("courses", conditionFields, conditionValues);
};

const createNewCourse = async (info) => {
    try {    
        const docRef = await coursesRef.add(info);   
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
const getOneCourse = async(condition) => {
    try {
        const conditionFields = Object.keys(condition);
        const conditionValues = Object.values(condition);
        const result = await dbUtils.findIntersect("courses", conditionFields, conditionValues);
        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
    }
}

const getManyCourses = async(condition) => {
    try {
        const conditionFields = Object.keys(condition);
        const conditionValues = Object.values(condition);
        const result = await dbUtils.findUnion("courses", conditionFields, conditionValues);
        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
    }
}

const getAllCourses = async() => {
    try{
        const result = await dbUtils.findAll("courses");
        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
    }
}

const updateCourse = async(course_id, updatingInfo) => {
    return await dbUtils.updateOne("courses", ["course_id"], [course_id], updatingInfo);
}

const deleteCourse = async(course_id) => {
    return dbUtils.deleteOne("courses", ["course_id"], [course_id]);
}


module.exports = {
    checkExist,
    createNewCourse,
    getOneCourse,
    getAllCourses,
    getManyCourses,
    updateCourse,
    deleteCourse,
}