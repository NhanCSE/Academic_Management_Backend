const { database: db } = require("../firebase/firebaseConnection");
const dbUtils = require("../lib/dbUtils");
const studentsRef = db.collection("students");
const modelsError = require("../models/error");

const createClass = async (info, classCollection) => {
    try {
        const classRef = db.collection(classCollection);
        await classRef.add(info);
        return {
            success: true
        }

    } catch (error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
    }
}

const getAllClasses = async (classCollection) => {
    return await dbUtils.findAll(classCollection);
}

// Đăng ký học phần
const registerClassSuccessForStudent = async(course, student, registerClass) => {
    try {
        // Update Class
        registerClass.students.push(student.student_id);
        const classCollection = `courses/${course.id}/classes`;
        const updatedInfo = {
            students: registerClass.students
        }

        await dbUtils.updateOne(classCollection, ["class_id"], [registerClass.class_id], updatedInfo);

        // Update Student modules
        const moduleCollection = `students/${student.id}/classes`;
        const classInfo = {
            course_id: registerClass.course_id,
            course_name: registerClass.course_name,
            class_id: registerClass.class_id,
            credits: registerClass.credits,
            semester: registerClass.semester,
            teacher: registerClass.teacher,
            room: registerClass.room,
            day: registerClass.day,
            period: registerClass.period,
        }
        
        await db.collection(moduleCollection).add(classInfo);
        
        return {
            success: true,
            message: `Ghi nhận đăng kí lớp ${registerClass.class_id} môn ${course.course_name} thành công cho sinh viên ${student.student_id}.`
        };
    } catch(error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
    }
}

const registerClassSuccessForTeacher = async(course, teacher, registerClass) => {
    try {
        // Update Class
        registerClass.teacher = teacher.teacher_id;
        const classCollection = `courses/${course.id}/classes`;
        const updatedInfo = {
            teacher: registerClass.teacher
        }

        await dbUtils.updateOne(classCollection, ["class_id"], [registerClass.class_id], updatedInfo);

        // Update Teacher class
        const teacherClassCollection = `teachers/${teacher.id}/classes`;
        const classInfo = {
            course_id: registerClass.course_id,
            course_name: registerClass.course_name,
            class_id: registerClass.class_id,
            credits: registerClass.credits,
            semester: registerClass.semester,
            teacher: registerClass.teacher,
            room: registerClass.room,
            day: registerClass.day,
            period: registerClass.period,
        }
        
        await db.collection(teacherClassCollection).add(classInfo);
        
        return {
            success: true,
            message: `Ghi nhận đăng kí lớp ${registerClass.class_id} môn ${course.course_name} thành công cho giảng viên ${teacher.teacher_id}.`
        };
    } catch(error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
    }
}

const getOneClass = async (classCollection, condition) => {
    try {
        const conditionFields = Object.keys(condition);
        const conditionValues = Object.values(condition);
        const result = await dbUtils.findIntersect(classCollection, conditionFields, conditionValues);
        return {
            success: true,
            data: result
        }
    } catch(error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
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
const getRegisteredClasses = async(info, isTeacher = false) => {
    try {
        // const Student = await getOneStudent({student_id: user.student_id});
        let classes
        if(isTeacher) classes = await dbUtils.findAll("teachers/" + info.id + "/classes");
        else classes = await dbUtils.findAll("students/" + info.id + "/classes");
        let data = []
        console.log(classes);
        for(let Class of classes) {
            if(Class.semester == "HK241") {
                data.push({
                    course_id: Class.course_id !== undefined ? Class.course_id : null,
                    course_name: Class.course_name !== undefined ? Class.course_name : null,
                    credit: Class.credits!== undefined ? Class.credits: null,
                    class_id: Class.class_id !== undefined ? Class.class_id : null,
                    teacher: Class.teacher !== undefined ? Class.teacher : null,
                    room: Class.room !== undefined ? Class.room : null,
                    day: Class.day !== undefined ? Class.day : null,
                    period: Class.period !== undefined ? Class.period : null,
                });
            }
        }

        return {
            success: true,
            data: data
        }
    } catch(error) {
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

const updateOneClass = async (dbCollection, class_id, updatedInfo) => {
    return await dbUtils.updateOne(dbCollection, ["class_id"], [class_id], updatedInfo);
}

const deleteOneClass = async(dbCollection, class_id) =>{
    return await dbUtils.deleteOne(dbCollection, ["class_id"], [class_id]);
}

module.exports = {
    createClass,
    registerClassSuccessForStudent,
    registerClassSuccessForTeacher,
    getOneClass,
    getAllClasses,
    getClasses,
    getRegisteredClasses,
    getScore,
    deleteOneClass,
    updateOneClass
}