const db = require("../firebase/firebaseConnection");
const dbUtils = require("../lib/dbUtils");
const studentsRef = db.collection("students");
const Subject = db.collection("subjects");
const modelsError = require("../models/error");

const checkExist = async (condition) => {
    const conditionFields = Object.keys(condition);
    const conditionValues = Object.values(condition);
    return await dbUtils.checkExist("students", conditionFields, conditionValues);
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
const updateInfoStudent = async(student_id, updatingInfo) => {
    return await dbUtils.updateOne("students", ["student_id"], [student_id], updatingInfo);
}

// 
const deleteStudent = async(student_id) => {
   return await dbUtils.deleteOne("students", ["student_id"], [student_id]);
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

const getScore = async(req) => {
    try{
        var data = []
        var check = true
        const query = studentsRef.where("student_id","==", req.user.student_id);
        const querySnapshot = await query.get();

        //Lấy dữ liệu điểm tất cả môn học trong học kỳ
        for (const doc of querySnapshot.docs) {
            const querySubject = studentsRef.doc(doc.id).collection("Học Phần").where("semester", "==", req.body.semester);
            const querySubjectSnapshot = await querySubject.get();
            if(querySubjectSnapshot.empty) check = false;
            querySubjectSnapshot.forEach((doc) => {
                var score = {
                    subject_id: doc.data().subject_id !== undefined ? doc.data().subject_id : null,
                    subject_name: doc.data().name !== undefined ? doc.data().name : null,
                    credits: doc.data().credits !== undefined ? doc.data().credits : null,
                    exercise_score: doc.data().exercise_score !== undefined ? doc.data().exercise_score : null,
                    assignment_score: doc.data().assignment_score !== undefined ? doc.data().assignment_score : null,
                    lab_score: doc.data().lab_score !== undefined ? doc.data().lab_score : null,
                    midterm_score: doc.data().midterm_score !== undefined ? doc.data().midterm_score : null,
                    finalterm_score: doc.data().finalterm_score !== undefined ? doc.data().finalterm_score : null,
                    gpa_4: doc.data().gpa_4 !== undefined ? doc.data().gpa_4 : null,
                    gpa_10: doc.data().gpa_10 !== undefined ? doc.data().gpa_10 : null,
                    letter_grade: doc.data().letter_grade !== undefined ? doc.data().letter_grade : null
                };
                data.push(score);
            });
        }
        
        //Tính điểm học kỳ và push vào cuối data
        var gpa_10 = 0, gpa_4 = 0, credits = 0;
        for(let x of data) {
            credits += x.credits;
            gpa_10 = gpa_10 + x.gpa_10 * x.credits;
            gpa_4 = gpa_4 + x.gpa_4 * x.credits;
        }
        data.push({
            credits: credits,
            gpa_10: parseFloat((gpa_10 / credits).toFixed(2)),
            gpa_4: parseFloat((gpa_4 / credits).toFixed(1)),
        })

        if(!check) {
            return {
                success: true,
                existed: false
            };
        }
        else {
            return {
                success: true,
                existed: true,
                data: data
            };
        }
    } catch(error) {
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
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
    getAllStudents,
    getScore
}