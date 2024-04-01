const db = require("../firebase/firebaseConnection");
const teachersRef = db.collection("teachers");
const studentsRef = db.collection("students");


const checkExist = async (teacherID) => {
    try {
        const query = teachersRef.where("teacher_id", "==", teacherID);
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

const getInfoTeacher = async (id) => {
    try{
        const query = await teachersRef.where("teacher_id", "==", id).get();
        if (query.empty) {
            return {
                success: false,
                error: `Không tìm thấy giảng viên có mã ${id}`
            };
        }

        const data = [];
        query.forEach(doc => {
            data.push(doc.data());
        });

        return {
            success: true,
            data: data
        };
    }
    catch{
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
}


module.exports = {
    checkExist,
    createNewTeacher,
    getInfoTeacher,
}