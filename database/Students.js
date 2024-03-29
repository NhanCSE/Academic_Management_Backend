const db = require("../firebase/firebaseConnection");
const dbUtils = require("../lib/dbUtils");
const studentsRef = db.collection("students");


const checkExist = async (studentID) => {
    try {
        const query = studentsRef.where("student_id", "==", studentID);
        const querySnapshot = await query.get();
        
        if (querySnapshot.empty) {
            return {
                success: true,
                existed: false
            };
        } else {
            return {
                success: true,
                existed: true
            };
        }
    } catch (error) {
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
};


const createNewStudent = async (info) => {
    try {
        const docRef = await studentsRef.add(info);
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

const getOneStudent = async (info) => {
    const conditionFields = Object.keys(info);
    const conditionValues = Object.values(info);
    return await dbUtils.findIntersect("students", conditionFields, conditionValues);
}

module.exports = {
    checkExist,
    createNewStudent,
    getOneStudent
}