const db = require("../firebase/firebaseConnection");
const dbUtils = require("../lib/dbUtils");
const studentsRef = db.collection("students");
const Subject = db.collection("subjects");
const modelsError = require("../models/error");

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

const checkExistSubject = async (subject_id) => {
    try {
        const query = Subject.where("subject_id","==",subject_id);
        const querySnapshot = await query.get();

        if(querySnapshot.empty){
            return {
                success: true,
                existed: false
            };
        }
        else {
            return {
                success: true,
                existed: true
            };
        }
    }
    catch(error) {
        console.error(error.message)
        return modelsError.error(500, error.message);
    }
}

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
        await Subject.add(info);
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
const updateInfoStudent = async(req) => {
    try {
        //const role = "Quản trị viên";
        const newData = req.body;
        const updateData = {
            address: newData.address,
            phone_number: newData.phone_number,
        };

        const query = studentsRef.where("student_id","==",req.user.student_id);
        const querySnapshot = await query.get();

        querySnapshot.forEach((doc) => {
            
            //Kiểm tra người dùng là quản trị viên hay sinh viên
            if(req.user.role == "Quản trị viên"){
                studentsRef.doc(doc.id).update(req.body)
            }        
            else {
                studentsRef.doc(doc.id).update(updateData)
            }
        });
        
          return {
            success: true
          };
    } catch(error) {
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// 
const deleteStudent = async(req) => {
    try {
        const query = studentsRef.where("student_id","==", req.body.student_id);
        const querySnapshot = await query.get();

        querySnapshot.forEach((doc) => {
            studentsRef.doc(doc.id).delete();
        });

        return{
            success: true
        }
    } catch(error) {
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Đăng ký học phần
const registerSubject = async(req) => {
    try {
        const query = studentsRef.where("student_id","==", req.user.student_id);
        const querySnapshot = await query.get();

        const data = {
            subject_id: req.body.subject_id,
            name: req.body.name,
            semester: req.body.semester,
            credits: req.body.credits
        };

        querySnapshot.forEach((doc) => {
            studentsRef.doc(doc.id).collection("Học Phần").add(data);
        });

        return {
            success: true
        };
    } catch(error) {
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
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
    checkExistSubject,
    createNewSubject,
    updateInfoStudent,
    deleteStudent,
    registerSubject,
    getOneStudent,
    getManyStudents,
    getAllStudents
}