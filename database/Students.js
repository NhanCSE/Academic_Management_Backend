const db = require("../firebase/firebaseConnection");
const dbUtils = require("../lib/dbUtils");
const studentsRef = db.collection("students");
//const Subject = db.collection("subjects");
const coursesRef = db.collection("courses")
const modelsError = require("../models/error");
const admin = require('firebase-admin');

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

// Đăng ký học phần
const registerSubject = async(info, user) => {
    try {
        const Student = await getOneStudent({student_id: user.student_id});
        const data = {
            course_id: info.course_id,
            course_name: info.course_name,
            semester: info.semester,
            credits: info.credits,
            class_id: info.class_id
        };

        var course = await dbUtils.findIntersect("courses", Object.keys({course_id: info.course_id}), Object.values({course_id: info.course_id}));
        var course_condition = course.course_condition; //Danh sách môn học tiên quyết
        
        var valid = true;
        //Kiểm tra môn học tiên quyết
        for(let x of course_condition) {
            const Subject = await dbUtils.findIntersect("students/" + Student.data.id + "/Học Phần", Object.keys({course_id: x}), Object.values({course_id: x}));
            if(Subject == null) {
                valid = false
                break
            }
            else if(Subject.passed == false) {
                valid = false
                break
            }
        }

        var Class = await dbUtils.findIntersect("courses/" + course.id + "/Class", Object.keys({class_id: info.class_id}), Object.values({class_id: info.class_id}));
        if(valid) {
            studentsRef.doc(Student.data.id).collection("Học Phần").add(data);
            coursesRef.doc(course.id).collection("Class").doc(Class.id).update({
                students: admin.firestore.FieldValue.arrayUnion(db.collection("students").doc(Student.data.id))
            });
        }

        return {
            success: true,
            valid: valid
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

const getScore = async(info, user) => {
    try{
        var data = []
        var check = true
        const query = studentsRef.where("student_id","==", user.student_id);
        const querySnapshot = await query.get();

        //Lấy dữ liệu điểm tất cả môn học trong học kỳ
        for (const doc of querySnapshot.docs) {
            const querySubject = studentsRef.doc(doc.id).collection("Học Phần").where("semester", "==", info.semester);
            const querySubjectSnapshot = await querySubject.get();
            if(querySubjectSnapshot.empty) check = false;
            querySubjectSnapshot.forEach((doc) => {
                var score = {
                    course_id: doc.data().course_id !== undefined ? doc.data().course_id : null,
                    course_name: doc.data().course_name !== undefined ? doc.data().course_name : null,
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