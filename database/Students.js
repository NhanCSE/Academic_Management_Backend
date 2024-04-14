const db = require("../firebase/firebaseConnection");
const dbUtils = require("../lib/dbUtils");
const studentsRef = db.collection("students");
//const Subject = db.collection("subjects");
const coursesRef = db.collection("courses")
const modelsError = require("../models/error");
const admin = require('firebase-admin');

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

//Kiểm tra trùng giờ học
const checkConflict = async(class1, class2) => {
    var conflict = false;
    if(class1.day == class2.day) {
        if((class1.period[0] >= class2.period[0] && class1.period[0] <= class2.period[class2.period.length - 1])
            || (class1.period[class1.period.length - 1] >= class2.period[0] && class1.period[class1.period.length - 1] <= class2.period[class2.period.length - 1]))
        {
            conflict = true;
        }
    }
    return conflict;
}

// Đăng ký học phần
const registerSubject = async(info, user) => {
    try {
        const Student = await getOneStudent({student_id: user.student_id});
        const data = {
            course_id: info.course_id !== undefined ? info.course_id : null,
            course_name: info.course_name !== undefined ? info.course_name : null,
            semester: "HK232",
            credits: info.credits !== undefined ? info.credits : null,
            class_id: info.class_id !== undefined ? info.class_id : null,
            teacher: info.teacher !== undefined ? info.teacher : null,
            room: info.room !== undefined ? info.room : null,
            day: info.day !== undefined ? info.day : null,
            period: info.period !== undefined ? info.period : null
        };

        var course = await dbUtils.findIntersect("courses", ["course_id"], [info.course_id]);
        var course_condition = course.course_condition; //Danh sách môn học tiên quyết
        
        var valid = true;
        //Kiểm tra môn học tiên quyết
        for(let x of course_condition) {
            const preSubject = await dbUtils.findIntersect("students/" + Student.data.id + "/Học Phần", ["course_id"], [x]);
            if(preSubject == null) {
                valid = false
                break
            }
            else if(preSubject.passed == false) {
                valid = false
                break
            }
        }

        var conflict = false;
        var Class = await dbUtils.findIntersect("courses/" + course.id + "/Class",["class_id"], [info.class_id]);
        var registeredClasses = await getRegisteredClasses(user);
        //Kiểm tra có trùng lịch không
        if(registeredClasses.success) {
            for(let x of registeredClasses.data) {
                if( await checkConflict(Class, x)) {
                    conflict = true
                    break
                }
            }
        }

        // Lưu mssv của các sv đã đk vào mảng students trong Class
        if(valid && !conflict) {
            //Xóa mssv đã đk trong 1 lớp và cập nhật sang lớp khác
            await coursesRef.doc(course.id).collection("Class").get().then(snapshot => {
                snapshot.forEach(doc => {
                coursesRef.doc(course.id).collection("Class").doc(doc.id).update({
                        students: admin.firestore.FieldValue.arrayRemove(Student.data.student_id)
                    })
                })
            })
            coursesRef.doc(course.id).collection("Class").doc(Class.id).update({
                students: admin.firestore.FieldValue.arrayUnion(Student.data.student_id)
            });
            //Xóa lớp đã đk và cập nhật sang lớp khác
            await dbUtils.deleteOne("students/" + Student.data.id + "/Học Phần", ["course_id"], [course.course_id])
            studentsRef.doc(Student.data.id).collection("Học Phần").add(data);
        }

        return {
            success: true,
            valid: valid,
            conflict: conflict
        };
    } catch(error) {
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
}


//Xóa học phần đã đăng ký
const deleteRegisteredSubject = async(info, user) => {
    try {
        const Student = await getOneStudent({student_id: user.student_id});
        //if(!Student.success) return Student;
        const deleteRegisteredClass = await dbUtils.deleteOne("students/" + Student.data.id + "/Học Phần", ["course_id"], [info.course_id]);
        //if(!deleteRegisteredClass.success) return deleteRegisteredClass;

        var course = await dbUtils.findIntersect("courses", ["course_id"], [info.course_id]);
        await coursesRef.doc(course.id).collection("Class").get().then(snapshot => {
            snapshot.forEach(doc => {
            coursesRef.doc(course.id).collection("Class").doc(doc.id).update({
                    students: admin.firestore.FieldValue.arrayRemove(Student.data.student_id)
                })
            })
        })

        return {
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

// Get các lớp hiện có của 1 học phần <-> hiển thị các lớp
// Nhập mã môn học 
const getClasses = async(info) => {
    try {
        var course = await dbUtils.findIntersect("courses", ["course_id"], [info.course_id]);
        const classes = await dbUtils.findAll("courses/" + course.id + "/Class");
        var data = []
        for(let Class of classes) {
            data.push({
                credits: course.credits !== undefined ? course.credits : null,
                course_name: course.course_name !== undefined ? course.course_name : null,
                course_id: course.course_id !== undefined ? course.course_id : null,
                class_id: Class.class_id !== undefined ? Class.class_id : null,
                teacher: Class.teacher !== undefined ? Class.teacher : null,
                max_num_of_st: Class.max_num_of_st !== undefined ? Class.max_num_of_st : null,
                num_of_st: (Class.students.length && Class.max_num_of_st) !== undefined ? Class.students.length + '/' + Class.max_num_of_st : null,
                room: Class.room !== undefined ? Class.room : null,
                day: Class.day !== undefined ? Class.day : null,
                period: Class.period !== undefined ? Class.period : null
            })
        }
        return {
            success: true,
            data: data
        };
    } catch(error) {
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get các lớp đã đăng ký 
const getRegisteredClasses = async(user) => {
    try {
        const Student = await getOneStudent({student_id: user.student_id});
        const classes = await dbUtils.findAll("students/" + Student.data.id + "/Học Phần")
        var data = []
        for(let Class of classes) {
            if(Class.semester == "HK232") {
                data.push({
                    course_id: Class.course_id !== undefined ? Class.course_id : null,
                    course_name: Class.course_name !== undefined ? Class.course_name : null,
                    credits: Class.credits !== undefined ? Class.credits : null,
                    class_id: Class.class_id !== undefined ? Class.class_id : null,
                    teacher: Class.teacher !== undefined ? Class.teacher : null,
                    room: Class.room !== undefined ? Class.room : null,
                    day: Class.day !== undefined ? Class.day : null,
                    period: Class.period !== undefined ? Class.period : null
                })
            }
        }

        return {
            success: true,
            data: data
        }
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
    deleteRegisteredSubject,
    getClasses,
    getRegisteredClasses,
    getOneStudent,
    getManyStudents,
    getAllStudents,
    getScore
}